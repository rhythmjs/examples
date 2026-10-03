import type { RedisClient } from "bun";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import { productsController } from "./products.controller";
import { productsService } from "./products.service";

export const productsModule = new Rhythm<
  RhythmHttpContext & { redis: RedisClient },
  { productsService: typeof productsService }
>({
  name: "products",
  type: "module",
}).use(productsController.middleware());

productsModule.context.productsService = productsService;
