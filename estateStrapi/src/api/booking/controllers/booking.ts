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
      return ctx.unauthorized();
    }

    const filters = {
      ...(ctx.query?.filters ?? {}),
      user: { id: user.id },
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
      return ctx.unauthorized();
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
      return ctx.unauthorized();
    }

    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) {
      return ctx.badRequest('Некорректный идентификатор брони');
    }

    const booking = await strapi.db.query('api::booking.booking').findOne({
      where: { id },
      select: ['id', 'user'],
    });

    if (!booking) {
      return ctx.notFound('Бронирование не найдено');
    }

    if (booking.user !== user.id) {
      return ctx.forbidden('Можно отменить только своё бронирование');
    }

    const updated = await strapi.service('api::booking.booking').update({
      where: { id },
      data: { status: 'cancelled' },
      populate: { session: { populate: { attraction: true } } },
    });

    ctx.body = { data: updated };
  },
};