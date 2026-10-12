/**
 * session controller
 *
 * Публичный find обогащает сеансы полем freeSeats и разворачивает
 * связь с аттракционом. Значение seatsTaken при этом остаётся
 * вычисленным сервером.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::session.session', ({ strapi }) => ({
  async find(ctx: any) {
    const sessionService = strapi.service('api::session.session');

    const filters = ctx.query?.filters ?? {};

    // Забираем сеансы документным сервисом: он умеет разворачивать
    // связи. Раньше здесь был низкоуровневый запрос без populate,
    // из-за чего поле attraction приходило пустым, а страницы
    // расписания и цен показывали сеансы без названия аттракциона.
    // pageSize приходит как pagination[pageSize], а limit стандартный
    // обработчик формирует уже после нашего кода — учитываем оба.
    const pagination = ctx.query?.pagination ?? {};
    const limit = Number(pagination.limit ?? pagination.pageSize ?? 100);

    const sessions = (await strapi
      .documents('api::session.session')
      .findMany({
        filters,
        populate: { attraction: true },
        sort: ['date:asc', 'startTime:asc'],
        limit: Number.isFinite(limit) && limit > 0 ? limit : 100,
      })) as any[];

    const sanitized = (await this.sanitizeOutput(sessions, ctx)) as any[];

    const data = sanitized.map((session: any) => ({
      ...session,
      freeSeats: sessionService.getFreeSeats(session),
    }));

    ctx.body = { data, meta: {} };
  },
}));