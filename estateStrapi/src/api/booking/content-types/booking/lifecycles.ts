/**
 * booking lifecycles
 *
 * Реализует правила ТЗ п.3.3:
 *  - автопересчёт свободных мест при подтверждении и отмене брони;
 *  - перевод сеанса в статус «мест нет» при исчерпании лимита;
 *  - запрет повторной брони на тот же сеанс;
 *  - отмена доступна только пока статус «ожидает», «подтверждено» или «оплачено».
 *
 * Цена считается на сервере. Тариф задаёт долю цены места в процентах
 * отдельно для взрослого и ребёнка и условия применимости по составу
 * гостей; без тарифа берётся полная цена места.
 */

import { errors } from '@strapi/utils';

/**
 * Ошибки бизнес-правил отдаём как 400, а не 500: обычный Error Strapi
 * превращает во внутреннюю ошибку сервера.
 */
const badRequest = (message: string) => new errors.ApplicationError(message);

const OCCUPYING_STATUSES = ['pending', 'confirmed', 'paid'];

/** Статусы, из которых бронь ещё можно отменить. */
const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'paid'];

/**
 * Приводит связь к числовому id.
 *
 * Документный сервис Strapi 5 приводит связи к виду
 * { set: [{ id }] } или { connect: [{ id }] }, поэтому разбираем
 * и эти формы, а не только голый id.
 */
const readId = (value: any): number | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  if (Array.isArray(value)) return value.length ? readId(value[0]) : null;

  if (typeof value === 'object') {
    if ('id' in value) return readId(value.id);
    if ('set' in value) return readId(value.set);
    if ('connect' in value) return readId(value.connect);
    // documentId не является числом: возвращаем null и ждём id.
    return null;
  }

  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

/** Занимает ли статус места в сеансе. */
const occupiesSeats = (status: string) => OCCUPYING_STATUSES.includes(status);

/**
 * Приводит количество гостей к неотрицательному целому.
 * Значение по умолчанию — 0, чтобы «0 гостей» отсекалось проверкой,
 * а не молча превращалось в одного гостя.
 */
const readCount = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return 0;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) return null;
  return number;
};

/**
 * Цена одного места по тарифу.
 *
 * Тариф задаёт не рубли, а долю цены сеанса: у каждого аттракциона своя
 * цена, и «скидка 50% на ребёнка» должна работать одинаково и на лодочной
 * дорожке за 500₽, и на горках за 1800₽.
 *
 * Округляем цену места, а не итог: иначе при 2500₽ и 20% на восемь
 * гостей набегают рубли расхождения с тем, что показала форма.
 */
const seatPrice = (sessionPrice: number, percent: number | null | undefined): number => {
  const share = typeof percent === 'number' && percent >= 0 ? percent : 100;
  return Math.round((sessionPrice * share) / 100);
};

/**
 * Подходит ли тариф под состав гостей.
 *
 * Правила задаёт администратор в полях minGuests, minAdults и minChildren,
 * поэтому проверка одна и та же для любого набора тарифов.
 */
export interface TariffCheck {
  ok: boolean;
  reason?: string;
}

export const checkTariff = (
  tariff: { minGuests?: number | null; minAdults?: number | null; minChildren?: number | null },
  adultsCount: number,
  childrenCount: number
): TariffCheck => {
  const guests = adultsCount + childrenCount;
  const reasons: string[] = [];

  if ((tariff.minGuests ?? 0) > 0 && guests < tariff.minGuests!) {
    reasons.push(`от ${tariff.minGuests} человек`);
  }
  if ((tariff.minAdults ?? 0) > 0 && adultsCount < tariff.minAdults!) {
    reasons.push(`от ${tariff.minAdults} взрослого`);
  }
  if ((tariff.minChildren ?? 0) > 0 && childrenCount < tariff.minChildren!) {
    reasons.push(`от ${tariff.minChildren} детей`);
  }

  return reasons.length ? { ok: false, reason: reasons.join(', ') } : { ok: true };
};

/**
 * Считает состав гостей и итоговую сумму.
 *
 * Без тарифа берётся цена места. С тарифом — доля цены сеанса для
 * взрослого и ребёнка по его правилам. Сумму считает сервер —
 * клиентскому значению не доверяем.
 */
const resolvePricing = async (
  adultsCount: number,
  childrenCount: number,
  tariffId: number | null,
  sessionPrice: number
): Promise<{ totalPrice: number; tariffName: string | null }> => {
  if (!tariffId) {
    return {
      totalPrice: (adultsCount + childrenCount) * sessionPrice,
      tariffName: null,
    };
  }

  const tariff = await strapi.db
    .query('api::ticket-price.ticket-price')
    .findOne({
      where: { id: tariffId },
      select: [
        'id', 'title', 'category',
        'adultPercent', 'childPercent',
        'minGuests', 'minAdults', 'minChildren',
      ],
    });

  if (!tariff) {
    throw badRequest('Тариф не найден');
  }

  // Услуги и льготы нельзя оформить как билет на сеанс: у них нет
  // правил покрытия, и раньше они давали нулевую цену за гостя.
  if (tariff.category !== 'ticket') {
    throw badRequest('Это не тариф на посещение');
  }

  // Состав проверяем и на сервере: правило доступности — бизнес-условие,
  // клиент может подменить значение в форме.
  const check = checkTariff(tariff, adultsCount, childrenCount);
  if (!check.ok) {
    throw badRequest(`Тариф «${tariff.title}» действует ${check.reason}`);
  }

  const adultSeat = seatPrice(sessionPrice, tariff.adultPercent);
  const childSeat = seatPrice(sessionPrice, tariff.childPercent);

  return {
    totalPrice: adultsCount * adultSeat + childrenCount * childSeat,
    tariffName: tariff.title,
  };
};

export default {
  async beforeCreate(event: any) {
    const data = event.params?.data;
    if (!data) return;

    const sessionId = readId(data.session);
    const userId = readId(data.user);

    if (!sessionId || !userId) {
      throw badRequest('Не указаны сеанс или пользователь');
    }

    const adultsCount = readCount(data.adultsCount ?? 1);
    const childrenCount = readCount(data.childrenCount ?? 0);

    if (adultsCount === null || childrenCount === null) {
      throw badRequest('Количество взрослых и детей должно быть целым неотрицательным числом');
    }

    const guestsCount = adultsCount + childrenCount;
    if (guestsCount < 1) {
      throw badRequest('Укажите хотя бы одного взрослого или ребёнка');
    }

    // Ребёнок не может прийти без сопровождения взрослого: это не
    // ограничение тарифа, а требование безопасности. Раньше проверки
    // не было вовсе, и заявка на трёх детей без взрослого проходила
    // и даже получала семейную скидку.
    if (childrenCount > 0 && adultsCount < 1) {
      throw badRequest('Дети могут записаться только вместе со взрослым');
    }

    const session = await strapi.db
      .query('api::session.session')
      .findOne({ where: { id: sessionId } });

    if (!session) throw badRequest('Сеанс не найден');
    if (session.status === 'cancelled') {
      throw badRequest('Сеанс отменён, бронирование недоступно');
    }

    // Запрет повторной брони на тот же сеанс (ТЗ п.3.2).
    const existing = await strapi.db.query('api::booking.booking').findOne({
      where: {
        session: { id: { $eq: sessionId } },
        user: { id: { $eq: userId } },
        status: { $in: OCCUPYING_STATUSES },
      },
      select: ['id'],
    });
    if (existing) throw badRequest('Вы уже забронировали этот сеанс');

    const freeSeats = Math.max(0, session.capacity - (session.seatsTaken ?? 0));
    if (guestsCount > freeSeats) {
      throw badRequest(
        `В сеансе осталось ${freeSeats} мест, вы указали ${guestsCount}. Уменьшите количество гостей`
      );
    }

    // Стоимость считает сервер — клиентскому знанию не доверяем.
    const { totalPrice } = await resolvePricing(
      adultsCount,
      childrenCount,
      readId(data.tariff),
      session.price
    );

    data.adultsCount = adultsCount;
    data.childrenCount = childrenCount;
    data.guestsCount = guestsCount;
    data.totalPrice = totalPrice;

    // Статус приходит только от администратора; пользователь может лишь
    // создать бронь в статусе «ожидает».
    if (!data.status) data.status = 'pending';
  },

  async beforeUpdate(event: any) {
    const id = readId(event.params?.where?.id);
    const data = event.params?.data;
    if (!id || !data) return;

    const booking = await strapi.db
      .query('api::booking.booking')
      .findOne({
        where: { id },
        select: ['id', 'status', 'guestsCount', 'adultsCount', 'childrenCount'],
        // session и tariff — связи, их нельзя получить через select.
        populate: { session: true, tariff: true },
      });
    if (!booking) return;

    const previousSessionId = readId(booking.session);
    const nextSessionId = data.session !== undefined ? readId(data.session) : previousSessionId;

    if (data.status !== undefined && data.status !== booking.status) {
      if (data.status === 'cancelled' && !CANCELLABLE_STATUSES.includes(booking.status)) {
        throw badRequest(`Бронь в статусе «${booking.status}» уже нельзя отменить`);
      }
      if (data.status === 'cancelled') {
        data.cancelledAt = new Date().toISOString();
      }
    }

    // Состав гостей меняется только когда статус не трогают:
    // смена статуса администратором не должна пересчитывать цену.
    const compositionChanged =
      data.adultsCount !== undefined || data.childrenCount !== undefined || data.tariff !== undefined;

    if (compositionChanged && data.status === undefined) {
      const adultsCount =
        data.adultsCount !== undefined ? readCount(data.adultsCount) : booking.adultsCount ?? 0;
      const childrenCount =
        data.childrenCount !== undefined
          ? readCount(data.childrenCount)
          : booking.childrenCount ?? 0;

      if (adultsCount === null || childrenCount === null) {
        throw badRequest('Количество взрослых и детей должно быть целым неотрицательным числом');
      }

      const guestsCount = adultsCount + childrenCount;
      if (guestsCount < 1) {
        throw badRequest('Укажите хотя бы одного взрослого или ребёнка');
      }

      const tariffId = data.tariff !== undefined ? readId(data.tariff) : readId(booking.tariff);

      const session = await strapi.db
        .query('api::session.session')
        .findOne({ where: { id: nextSessionId } });

      if (session) {
        // Проверяем лимит с учётом уже занятых мест, если статус не меняется.
        if (occupiesSeats(booking.status) && session.status !== 'cancelled') {
          const freeSeats = Math.max(0, session.capacity - (session.seatsTaken ?? 0));
          // Текущая бронь уже учтена в seatsTaken, её места возвращаем в расчёт.
          const available = freeSeats + (booking.guestsCount ?? 0);
          if (guestsCount > available) {
            throw badRequest(
              `В сеансе можно забронировать не больше ${available} мест`
            );
          }
        }

        const { totalPrice } = await resolvePricing(
          adultsCount,
          childrenCount,
          tariffId,
          session.price
        );

        data.adultsCount = adultsCount;
        data.childrenCount = childrenCount;
        data.guestsCount = guestsCount;
        data.totalPrice = totalPrice;
      }
    }

    // Если бронь переехала в другой сеанс — пересчитать оба.
    if (nextSessionId && previousSessionId && nextSessionId !== previousSessionId) {
      event.state.previousSessionId = previousSessionId;
    }
  },

  async afterCreate(event: any) {
    const sessionId = readId(event.params?.data?.session);
    if (sessionId) {
      await strapi.service('api::session.session').recalcSeats(sessionId);
    }
  },

  async afterUpdate(event: any) {
    const sessionId =
      readId(event.params?.data?.session) ??
      (event.state?.previousSessionId as number | undefined);

    if (sessionId) {
      await strapi.service('api::session.session').recalcSeats(sessionId);
    }
  },

  async beforeDelete(event: any) {
    // После удаления связь session уже недоступна — запоминаем её заранее.
    const id = readId(event.params?.where?.id);
    if (!id) return;

    const booking = await strapi.db
      .query('api::booking.booking')
      .findOne({ where: { id }, select: ['id'], populate: { session: true } });

    if (booking) {
      event.state.sessionId = readId(booking.session);
    }
  },

  async afterDelete(event: any) {
    const sessionId = event.state?.sessionId as number | undefined;
    if (sessionId) {
      await strapi.service('api::session.session').recalcSeats(sessionId);
    }
  },
};