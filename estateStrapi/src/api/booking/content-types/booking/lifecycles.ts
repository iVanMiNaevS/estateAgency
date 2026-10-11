/**
 * booking lifecycles
 *
 * Реализует правила ТЗ п.3.3:
 *  - автопересчёт свободных мест при подтверждении и отмене брони;
 *  - перевод сеанса в статус «мест нет» при исчерпании лимита;
 *  - запрет повторной брони на тот же сеанс;
 *  - отмена доступна только пока статус «ожидает», «подтверждено» или «оплачено».
 *
 * Цена считается на сервере: тариф разделяет взрослых и детей,
 * иначе используется цена места в сеансе.
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
 * Считает состав гостей и итоговую сумму.
 *
 * Цена зависит от тарифа: если у него заданы отдельные цены для взрослого
 * и ребёнка, считаем по ним, иначеFallback на цену места в сеансе.
 * Сумму считает сервер — клиентскому значению не доверяем.
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
    .findOne({ where: { id: tariffId }, select: ['id', 'title', 'adultPrice', 'childPrice', 'price'] });

  if (!tariff) {
    throw badRequest('Тариф не найден');
  }

  const adultPrice = tariff.adultPrice ?? 0;
  const childPrice = tariff.childPrice ?? 0;

  // Если тариф не разделяет категории, берём его общую цену.
  const usesSplit = adultPrice > 0 || childPrice > 0;
  if (!usesSplit) {
    return {
      totalPrice: (adultsCount + childrenCount) * (tariff.price || sessionPrice),
      tariffName: tariff.title,
    };
  }

  return {
    totalPrice: adultsCount * adultPrice + childrenCount * childPrice,
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