/**
 * register / bootstrap
 *
 * Раздаём ролям минимально необходимые права.
 *
 * Важно: в плагине users-permissions право — это строка вида
 * `api::attraction.attraction.find` в колонке `action`, а связь с ролью
 * хранится в up_permissions_role_lnk. Поля `contentType` в модели права нет.
 *
 * Роли:
 *   public        — гость сайта, читает публичный контент;
 *   authenticated — авторизованный клиент, дополнительно оформляет
 *                  бронирования и правит свой профиль.
 *
 * Права на user.update НЕ выдаются: в плагине этот экшен принимает
 * `role` в теле запроса и не сверяет id из URL с текущим пользователем,
 * поэтому его выдача позволила бы любому клиенту выдать себе роль
 * администратора. Профиль редактируется через api::profile.profile,
 * где разрешено менять только разрешённые поля.
 */

type Action = string;

/** Публичное чтение контента. */
const PUBLIC_ACTIONS: Action[] = [
  'api::attraction.attraction.find',
  'api::attraction.attraction.findOne',
  'api::session.session.find',
  'api::session.session.findOne',
  'api::news-item.news-item.find',
  'api::news-item.news-item.findOne',
  'api::page.page.find',
  'api::page.page.findOne',
  'api::ticket-price.ticket-price.find',
  'api::ticket-price.ticket-price.findOne',
  'api::gallery-album.album.find',
  'api::gallery-album.album.findOne',
  'api::gallery-item.gallery-item.find',
  'api::gallery-item.gallery-item.findOne',
  'api::main-screen.main-screen.find',
  'api::review.review.find',
  'api::review.review.findOne',
  // Быстрая заявка без регистрации.
  'api::user-request.user-request.create',
];

/** Возможности авторизованного клиента. */
const AUTHENTICATED_EXTRA_ACTIONS: Action[] = [
  'api::booking.booking.find',
  'api::booking.booking.create',
  'api::booking.booking.cancel',
  'api::profile.profile.find',
  'api::profile.profile.update',
  'plugin::users-permissions.user.me',
];

/**
 * Действия плагина, без которых не работают регистрация, вход
 * и восстановление пароля. Нужны обеим ролям.
 */
const AUTH_PLUGIN_ACTIONS: Action[] = [
  'plugin::users-permissions.auth.register',
  'plugin::users-permissions.auth.callback',
  'plugin::users-permissions.auth.forgotPassword',
  'plugin::users-permissions.auth.resetPassword',
  'plugin::users-permissions.auth.emailConfirmation',
  'plugin::users-permissions.auth.sendEmailConfirmation',
  'plugin::users-permissions.auth.changePassword',
];

const PUBLIC_ALLOWLIST = [...PUBLIC_ACTIONS, ...AUTH_PLUGIN_ACTIONS];
const AUTHENTICATED_ALLOWLIST = [...PUBLIC_ACTIONS, ...AUTHENTICATED_EXTRA_ACTIONS];

const ensurePermission = async (strapi: any, action: Action, roleId: number): Promise<boolean> => {
  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');

  let permission = await permissionQuery.findOne({ where: { action } });
  if (!permission) {
    permission = await permissionQuery.create({ data: { action } });
  }

  // Право может быть создано плагином сразу для обеих ролей — проверяем связь.
  const existing = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({
      where: { id: roleId },
      populate: { permissions: true },
      select: ['id', 'permissions'],
    });

  const alreadyGranted = (existing?.permissions ?? []).some((p: any) => p.action === action);
  if (alreadyGranted) return false;

  await strapi.db
    .query('plugin::users-permissions.permission')
    .update({ where: { id: permission.id }, data: { role: [roleId] } });

  return true;
};

/**
 * Убирает у роли всё, чего нет в белом списке.
 *
 * Это обязательная часть: в базе шаблона у роли authenticated остались
 * права на изменение и удаление контента (main-screen, estate, review),
 * из-за чего любой вошедший клиент мог переписать главную страницу
 * сайта. Права из шаблона — estate и review — модели не относятся
 * к парку, поэтому роль заканчивается ровно белым списком.
 */
const revokeExtraPermissions = async (
  strapi: any,
  roleId: number,
  allowlist: Action[]
): Promise<number> => {
  const allowed = new Set(allowlist);

  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({
      where: { id: roleId },
      populate: { permissions: true },
      select: ['id', 'permissions'],
    });

  const current = role?.permissions ?? [];

  let revoked = 0;
  for (const permission of current) {
    if (allowed.has(permission.action)) continue;
    await strapi.db
      .query('plugin::users-permissions.permission')
      .delete({ where: { id: permission.id } });
    revoked += 1;
  }

  return revoked;
};

export default {
  register() {},

  async bootstrap({ strapi }: any) {
    const roleByType = async (type: string) =>
      strapi.db.query('plugin::users-permissions.role').findOne({ where: { type } });

    const roles = [
      { type: 'public', allowlist: PUBLIC_ALLOWLIST },
      { type: 'authenticated', allowlist: AUTHENTICATED_ALLOWLIST },
    ];

    let granted = 0;
    let revoked = 0;

    for (const { type, allowlist } of roles) {
      const role = await roleByType(type);
      if (!role) continue;

      for (const action of allowlist) {
        try {
          if (await ensurePermission(strapi, action, role.id)) granted += 1;
        } catch (error: any) {
          strapi.log.error(`Не удалось выдать право "${action}" роли ${type}: ${error.message}`);
        }
      }

      try {
        const removed = await revokeExtraPermissions(strapi, role.id, allowlist);
        revoked += removed;
        if (removed > 0) {
          strapi.log.warn(
            `users-permissions: у роли ${type} отозвано лишних прав — ${removed}`
          );
        }
      } catch (error: any) {
        strapi.log.error(`Не удалось отозвать лишние права роли ${type}: ${error.message}`);
      }
    }

    if (granted > 0) {
      strapi.log.info(`users-permissions: выдано прав — ${granted}`);
    }
  },
};