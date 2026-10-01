import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { RedisClient } from "bun";
import type { productsService } from "./products.service";

export type ProductsContext = RhythmHttpContext & {
  redis: RedisClient;
  productsService: typeof productsService;
};

const TTL_SECONDS = 60;
const cacheKey = (id: string) => `product:${id}`;

export const productsController = new RhythmRouter<ProductsContext>({ prefix: "/products" })
  .get("/:id", async (ctx) => {
    const key = cacheKey(ctx.params.id);

    const hit = await ctx.redis.get(key);
    if (hit !== null) {
      ctx.response.headers.set("x-cache", "hit");
      ctx.json(JSON.parse(hit));
      return;
    }

    const product = await ctx.productsService.get(ctx.params.id);
    if (!product) {
      ctx.error(404, "Product not found");
      return;
    }

    await ctx.redis.set(key, JSON.stringify(product));
    await ctx.redis.expire(key, TTL_SECONDS);
    ctx.response.headers.set("x-cache", "miss");
    ctx.json(product);
  })
  .patch("/:id", async (ctx) => {
    const { name, price } = (await ctx.request.json()) as { name?: string; price?: number };
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      ctx.error(400, "price must be a non-negative number");
      return;
    }

    const product = ctx.productsService.update(ctx.params.id, { name, price });
    if (!product) {
      ctx.error(404, "Product not found");
      return;
    }

    await ctx.redis.del(cacheKey(ctx.params.id));
    ctx.json(product);
  });
