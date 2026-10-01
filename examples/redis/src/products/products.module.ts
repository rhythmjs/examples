import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { closeRedis, createRedis } from "../redis";
import { productsController } from "./products.controller";
import { productsService } from "./products.service";

export const productsModule = new Rhythm<RhythmHttpContext>({ name: "products", type: "module" })
  .provide(createRedis, closeRedis)
  .provide(() => ({ productsService }))
  .use(productsController.middleware());
