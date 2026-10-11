/**
 * booking lifecycles
 *
 * Реализует правила ТЗ п.3.3:
 *  - автопересчёт свободных мест при подтверждении и отмене брони;
 *  - перевод сеанса в статус «мест нет» при исчерпании лимита;
 *  - запрет повторной брони на тот же сеанс;
 *  - отмена доступна только пока статус «ожидает» или «подтверждено».
 */

const OCCUPYING_STATUSES = ['pending', 'confirmed'];

/** Статусы, из которых бронь ещё можно отменить. */
const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

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

export default {
  async beforeCreate(event: any) {
    const data = event.params?.data;
    if (!data) return;

    const sessionId = readId(data.session);
    const userId = readId(data.user);

    if (!sessionId || !userId) {
      throw new Error('Не указаны сеанс или пользователь');
    }

    const guestsCount = Number(data.guestsCount ?? 1);
    if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      throw new Error('Количество гостей должно быть целым числом не меньше 1');
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
    data.guestsCount = guestsCount;
    data.totalPrice = guestsCount * session.price;
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
        select: ['id', 'status', 'guestsCount', 'session'],
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

    if (data.guestsCount !== undefined && data.status === undefined) {
      const guestsCount = Number(data.guestsCount);
      if (!Number.isInteger(guestsCount) || guestsCount < 1) {
        throw new Error('Количество гостей должно быть целым числом не меньше 1');
      }

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
        data.totalPrice = guestsCount * session.price;
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