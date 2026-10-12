/**
 * booking router
 *
 * Публичный доступ выдан только на создание заявки-брони и отмену своей брони.
 * Просмотр всех броней (для администратора) остаётся закрытым:
 * админ работает через Strapi Admin, а не через Content API.
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/bookings/me',
      handler: 'booking.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bookings',
      handler: 'booking.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bookings/:id/cancel',
      handler: 'booking.cancel',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/bookings/:id/prepay',
      handler: 'booking.prepay',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};