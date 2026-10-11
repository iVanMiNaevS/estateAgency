import { errors } from '@strapi/utils';

/** Статусы, из которых клиент ещё может отменить бронь. */
const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'paid'];

/**
 * booking controller
 *
 * Пользователь работает только со своими бронированиями:
 * find отдаёт собственные записи, а create подставляет текущего
 * пользователя из ctx.state.user — подделать чужой userId нельзя.
 */

export default {
  /**
   * Список броней. Для авторизованного пользователя возвращаем только его записи.
   */
  async find(ctx: any) {
    const { user } = ctx.state;

    if (!user) {
      throw new errors.UnauthorizedError();
    }

    const filters = {
      ...(ctx.query?.filters ?? {}),
      user: { id: { $eq: user.id } },
    };

    const { results, pagination } = await strapi.service('api::booking.booking').find({
      ...ctx.query,
      filters,
      populate: {
        session: { populate: { attraction: true } },
      },
      sort: { createdAt: 'desc' },
    });

    ctx.body = {
      data: results,
      meta: { pagination },
    };
  },

  /**
   * Создание брони. Пользователь и статус выставляются на сервере.
   */
  async create(ctx: any) {
    const { user } = ctx.state;

    if (!user) {
      throw new errors.UnauthorizedError();
    }

    const body = ctx.request.body?.data ?? {};

    const booking = await strapi.service('api::booking.booking').create({
      data: {
        session: body.session,
        tariff: body.tariff,
        adultsCount: body.adultsCount ?? 1,
        childrenCount: body.childrenCount ?? 0,
        contactName: body.contactName ?? user.name,
        contactPhone: body.contactPhone ?? user.phone,
        wishes: body.wishes,
        // user, guestsCount и totalPrice проставляются в lifecycles,
        // статус всегда «pending».
        user: user.id,
        status: 'pending',
      },
      populate: { session: { populate: { attraction: true } }, tariff: true },
    });

    ctx.body = { data: booking };
  },

  /**
   * Отмена брони. Проверяем, что бронь принадлежит текущему пользователю;
   * допустимость статуса проверяет lifecycle beforeUpdate.
   */
  async cancel(ctx: any) {
    const { user } = ctx.state;

    if (!user) {
      throw new errors.UnauthorizedError();
    }

    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) {
      throw new errors.ApplicationError('Некорректный идентификатор брони');
    }

    // Связь user нельзя выбрать через select: это не колонка, а запись
    // в таблице связей, поэтому запрашиваем её через populate.
    const booking = await strapi.db.query('api::booking.booking').findOne({
      where: { id },
      select: ['id', 'status'],
      populate: { user: true, session: true },
    });

    if (!booking) {
      throw new errors.NotFoundError('Бронирование не найдено');
    }

    if (booking.user?.id !== user.id) {
      throw new errors.ForbiddenError('Можно отменить только своё бронирование');
    }

    // Отменяем через db.query: документный сервис Strapi некорректно
    // строит where для этой сущности из-за связей user/session/tariff.
    // Правила проверяем здесь явно, места пересчитываем через сервис.
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new errors.ApplicationError(
        `Бронь в статусе «${booking.status}» уже нельзя отменить`
      );
    }

    const updated = await strapi.db
      .query('api::booking.booking')
      .update({
        where: { id },
        data: { status: 'cancelled', cancelledAt: new Date().toISOString() },
      });

    // Возвращаем освободившиеся места в сеанс.
    const sessionId = Number(booking.session?.id);
    if (Number.isFinite(sessionId)) {
      await strapi.service('api::session.session').recalcSeats(sessionId);
    }

    ctx.body = { data: updated };
  },
};