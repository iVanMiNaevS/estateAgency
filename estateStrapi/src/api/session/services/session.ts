/**
 * session service
 *
 * Главная ответственность — корректный пересчёт занятых мест в сеансе.
 * Значение seatsTaken нельзя доверять клиенту: оно всегда вычисляется
 * из активных бронирований (см. booking/lifecycles.ts).
 */

import { factories } from '@strapi/strapi';

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'paid'] as const;

export default factories.createCoreService('api::session.session', ({ strapi }) => ({
  /**
   * Пересчитывает seatsTaken и статус сеанса по фактическим бронированиям.
   * Вызывается из lifecycles модели booking при любом изменении брони.
   */
  async recalcSeats(sessionId: number | string) {
    const id = Number(sessionId);
    if (!Number.isFinite(id)) return null;

    const session = await strapi.db.query('api::session.session').findOne({ where: { id } });
    if (!session) return null;

    // К брони неактивного сеанса места не возвращаем: их разбирает администратор.
    const activeSessions = session.status !== 'cancelled';

    const bookings = await strapi.db.query('api::booking.booking').findMany({
      where: {
        session: { id },
        ...(activeSessions ? { status: { $in: [...ACTIVE_BOOKING_STATUSES] } } : {}),
      },
      select: ['id', 'guestsCount', 'status'],
    });

    const seatsTaken = bookings.reduce((sum, booking) => sum + (booking.guestsCount ?? 0), 0);

    // Отменённый сеанс сохраняет накопленное число, но не меняет статус.
    let status = session.status;
    if (session.status !== 'cancelled') {
      status = seatsTaken >= session.capacity ? 'full' : 'open';
    }

    if (seatsTaken === session.seatsTaken && status === session.status) {
      return session;
    }

    await strapi.db
      .query('api::session.session')
      .update({ where: { id }, data: { seatsTaken, status } });

    return { ...session, seatsTaken, status };
  },

  /**
   * Сколько мест осталось в сеансе. Значение не может уйти в минус.
   */
  getFreeSeats(session: { capacity: number; seatsTaken: number }): number {
    return Math.max(0, session.capacity - (session.seatsTaken ?? 0));
  },
}));