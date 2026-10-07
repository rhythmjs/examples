import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import { redisModule } from "../redis/redis.module";
import { productsController } from "./products.controller";
import { productsService } from "./products.service";

export const productsModule = new Rhythm({ name: "products" })
  .register(include(redisModule, ({ redis }) => ({ redis })))
  .register(decorate(() => ({ productsService })))
  .use(mount(productsController));
