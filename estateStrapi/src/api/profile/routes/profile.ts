/**
 * profile router
 *
 * Только два действия: посмотреть и изменить свой профиль.
 * Доступ выдаётся роли authenticated (см. src/index.ts).
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/profile',
      handler: 'profile.find',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/profile',
      handler: 'profile.update',
      config: { policies: [], middlewares: [] },
    },
  ],
};