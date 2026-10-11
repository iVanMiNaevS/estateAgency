/**
 * register / bootstrap
 *
 * Раздаём минимальные права роли Public: гость сайта может читать
 * публичный контент и оставить быструю заявку, но не видит
 * бронирований и данных пользователей.
 */

type PermissionSeed = {
  contentType: string;
  action: string;
};

const PUBLIC_ACTIONS: PermissionSeed[] = [
  /* Публичный контент — только чтение. */
  { contentType: 'attractions', action: 'find' },
  { contentType: 'attractions', action: 'findOne' },
  { contentType: 'sessions', action: 'find' },
  { contentType: 'sessions', action: 'findOne' },
  { contentType: 'news_items', action: 'find' },
  { contentType: 'news_items', action: 'findOne' },
  { contentType: 'pages', action: 'find' },
  { contentType: 'pages', action: 'findOne' },
  { contentType: 'ticket_prices', action: 'find' },
  { contentType: 'ticket_prices', action: 'findOne' },
  { contentType: 'main_screens', action: 'find' },
  { contentType: 'reviews', action: 'find' },
  { contentType: 'reviews', action: 'findOne' },

  /* Быстрая заявка без регистрации (ТЗ п.2, таблица прав). */
  { contentType: 'user_requests', action: 'create' },
];

export default {
  register() {},

  async bootstrap({ strapi }: any) {
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const currentPermissions = Array.isArray(publicRole.permissions)
      ? publicRole.permissions
      : [];

    const existing = new Set(
      currentPermissions.map((permission: any) => `${permission.contentType}:${permission.action}`)
    );

    const missing = PUBLIC_ACTIONS.filter(
      (candidate) => !existing.has(`${candidate.contentType}:${candidate.action}`)
    );

    for (const candidate of missing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action: candidate.action,
          contentType: candidate.contentType,
          role: publicRole.id,
          enabled: true,
        },
      });
    }

    if (missing.length > 0) {
      strapi.log.info(`users-permissions: выдано публичных прав — ${missing.length}`);
    }
  },
};