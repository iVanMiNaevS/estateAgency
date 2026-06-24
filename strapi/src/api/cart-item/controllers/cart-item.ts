import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::cart-item.cart-item",
  ({ strapi }) => ({
    async delete(ctx) {
      const { id } = ctx.params;

      const entity = await strapi.entityService.findOne(
        "api::cart-item.cart-item",
        id
      );
      if (!entity) {
        return ctx.notFound("Item not found");
      }

      await strapi.entityService.delete("api::cart-item.cart-item", id);

      ctx.send({ message: "Deleted" });
    },
  })
);
