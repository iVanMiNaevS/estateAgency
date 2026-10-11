/**
 * session controller
 *
 * Публичный find обогащает сеансы полями, которые нужны фронту:
 * freeSeats и название аттракциона. Значение seatsTaken при этом
 * остаётся вычисленным сервером.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::session.session', ({ strapi }) => ({
  async find(ctx: any) {
    const sessionService = strapi.service('api::session.session');

    const filters = ctx.query?.filters ?? {};

    const sessions = await strapi.db.query('api::session.session').findMany({
      where: filters,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      limit: ctx.query?.pagination?.limit ?? 100,
    });

    const attractionIds = [...new Set(sessions.map((s: any) => s.attraction).filter(Boolean))];
    const attractions = attractionIds.length
      ? await strapi.db.query('api::attraction.attraction').findMany({
          where: { id: { $in: attractionIds } },
          select: ['id', 'title', 'slug', 'type'],
        })
      : [];
    const attractionById = new Map(attractions.map((a: any) => [a.id, a]));

    const sanitized = (await this.sanitizeOutput(sessions, ctx)) as any[];

    const data = sanitized.map((session: any) => ({
      ...session,
      freeSeats: sessionService.getFreeSeats(session),
      attraction: attractionById.get(session.attraction) ?? null,
    }));

    ctx.body = { data, meta: {} };
  },
}));