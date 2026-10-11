/**
 * session lifecycles
 *
 * Следит за тем, чтобы лимит сеанса не опустился ниже уже занятого
 * числа мест, иначе счётчик «осталось N мест» станет отрицательным.
 */

import { errors } from '@strapi/utils';

/**
 * Ошибки бизнес-правил отдаём как 400, а не 500: обычный Error Strapi
 * превращает во внутреннюю ошибку сервера.
 */
const badRequest = (message: string) => new errors.ApplicationError(message);

const readId = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) return Number(value.id);
  if (typeof value === 'string' && value !== '') return Number(value);
  return null;
};

export default {
  async beforeUpdate(event: any) {
    const id = readId(event.params?.where?.id);
    const data = event.params?.data;
    if (!id || !data) return;

    if (data.capacity !== undefined) {
      const session = await strapi.db
        .query('api::session.session')
        .findOne({ where: { id }, select: ['id', 'capacity', 'seatsTaken'] });

      const seatsTaken = session?.seatsTaken ?? 0;
      const capacity = Number(data.capacity);

      if (!Number.isInteger(capacity) || capacity < 1) {
        throw badRequest('Лимит мест должен быть целым числом не меньше 1');
      }
      if (capacity < seatsTaken) {
        throw badRequest(
          `Нельзя поставить лимит ${capacity}: в сеансе уже занято ${seatsTaken} мест. Сначала отмените лишние брони`
        );
      }
    }

    if (data.price !== undefined && Number(data.price) < 0) {
      throw badRequest('Цена не может быть отрицательной');
    }
  },

  async beforeCreate(event: any) {
    const data = event.params?.data;
    if (!data) return;

    const capacity = Number(data.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw badRequest('Лимит мест должен быть целым числом не меньше 1');
    }

    // seatsTaken задаёт только пересчёт из бронирований.
    data.seatsTaken = 0;
    if (data.status === 'cancelled') {
      data.status = 'cancelled';
    }
  },
};