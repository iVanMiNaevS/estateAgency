import { errors } from '@strapi/utils';

/**
 * profile controller
 *
 * Чтение и правка профиля текущего пользователя.
 *
 * Отдельный эндпоинт нужен потому, что штатный
 * `plugin::users-permissions.user.update` небезопасен для клиентской роли:
 * он принимает `role` в теле запроса и не сверяет id из URL с текущим
 * пользователем. Здесь белый список полей исключает любую смену роли.
 */

/** Поля, которые пользователь может менять у себя. */
const EDITABLE_FIELDS = ['name', 'lastName', 'phone', 'birthDate', 'city'] as const;

const pickEditable = (body: Record<string, any>) => {
  const data: Record<string, any> = {};

  for (const field of EDITABLE_FIELDS) {
    if (body[field] === undefined) continue;
    data[field] = body[field];
  }

  return data;
};

const validate = (data: Record<string, any>) => {
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
    throw new Error('Имя не может быть пустым');
  }
  if (data.lastName !== undefined && typeof data.lastName !== 'string') {
    throw new Error('Фамилия должна быть строкой');
  }
  if (data.city !== undefined && typeof data.city !== 'string') {
    throw new Error('Город должен быть строкой');
  }
  if (data.phone !== undefined && typeof data.phone !== 'string') {
    throw new Error('Телефон должен быть строкой');
  }
  if (data.birthDate !== undefined && data.birthDate !== null && data.birthDate !== '') {
    const parsed = new Date(data.birthDate);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Дата рождения указана в неверном формате');
    }
    if (parsed > new Date()) {
      throw new Error('Дата рождения не может быть в будущем');
    }
  }
};

export default {
  /**
   * Профиль текущего пользователя.
   */
  async find(ctx: any) {
    const { user } = ctx.state;
    if (!user) throw new errors.UnauthorizedError();

    const profile = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: user.id } });

    if (!profile) throw new errors.NotFoundError('Пользователь не найден');

    ctx.body = {
      data: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        name: profile.name,
        lastName: profile.lastName,
        phone: profile.phone,
        city: profile.city,
        birthDate: profile.birthDate,
        blocked: profile.blocked,
      },
    };
  },

  /**
   * Правка профиля текущего пользователя.
   */
  async update(ctx: any) {
    const { user } = ctx.state;
    if (!user) throw new errors.UnauthorizedError();

    if (user.blocked) {
      throw new errors.ForbiddenError('Учётная запись заблокирована');
    }

    const body = ctx.request.body?.data ?? {};
    const data = pickEditable(body);

    if (Object.keys(data).length === 0) {
      throw new errors.ApplicationError('Нет полей для обновления');
    }

    validate(data);

    // Обновляем строго свою запись — id берём из токена, а не из тела.
    const updated = await strapi.db
      .query('plugin::users-permissions.user')
      .update({ where: { id: user.id }, data });

    ctx.body = {
      data: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        name: updated.name,
        lastName: updated.lastName,
        phone: updated.phone,
        city: updated.city,
        birthDate: updated.birthDate,
      },
    };
  },
};