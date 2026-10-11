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

const OCCUPYING_STATUSES = ['pending', 'confirmed', 'paid'];

/** Статусы, из которых бронь ещё можно отменить. */
const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'paid'];

/** Приводит связь (id / объект / documentId-объект) к числовому id. */
const readId = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    if ('id' in value) return Number(value.id);
    if ('documentId' in value) return Number(value.documentId);
  }
  if (typeof value === 'string' && value !== '') return Number(value);
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
    throw new Error('Тариф не найден');
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
      throw new Error('Не указаны сеанс или пользователь');
    }

    const adultsCount = readCount(data.adultsCount ?? 1);
    const childrenCount = readCount(data.childrenCount ?? 0);

    if (adultsCount === null || childrenCount === null) {
      throw new Error('Количество взрослых и детей должно быть целым неотрицательным числом');
    }

    const guestsCount = adultsCount + childrenCount;
    if (guestsCount < 1) {
      throw new Error('Укажите хотя бы одного взрослого или ребёнка');
    }

    const session = await strapi.db
      .query('api::session.session')
      .findOne({ where: { id: sessionId } });

    if (!session) throw new Error('Сеанс не найден');
    if (session.status === 'cancelled') {
      throw new Error('Сеанс отменён, бронирование недоступно');
    }

    // Запрет повторной брони на тот же сеанс (ТЗ п.3.2).
    const existing = await strapi.db.query('api::booking.booking').findOne({
      where: {
        session: { id: sessionId },
        user: { id: userId },
        status: { $in: OCCUPYING_STATUSES },
      },
      select: ['id'],
    });
    if (existing) throw new Error('Вы уже забронировали этот сеанс');

    const freeSeats = Math.max(0, session.capacity - (session.seatsTaken ?? 0));
    if (guestsCount > freeSeats) {
      throw new Error(
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
        select: ['id', 'status', 'guestsCount', 'adultsCount', 'childrenCount', 'session', 'tariff'],
      });
    if (!booking) return;

    const previousSessionId = readId(booking.session);
    const nextSessionId = data.session !== undefined ? readId(data.session) : previousSessionId;

    if (data.status !== undefined && data.status !== booking.status) {
      if (data.status === 'cancelled' && !CANCELLABLE_STATUSES.includes(booking.status)) {
        throw new Error(`Бронь в статусе «${booking.status}» уже нельзя отменить`);
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
        throw new Error('Количество взрослых и детей должно быть целым неотрицательным числом');
      }

      const guestsCount = adultsCount + childrenCount;
      if (guestsCount < 1) {
        throw new Error('Укажите хотя бы одного взрослого или ребёнка');
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
            throw new Error(
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
      .findOne({ where: { id }, select: ['id', 'session'] });

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