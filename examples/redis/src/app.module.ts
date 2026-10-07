import { Rhythm, decorate, include, mount } from "@rhythmjs/rhythm";
import { appController } from "./app.controller";
import { appService } from "./app.service";
import { productsModule } from "./products/products.module";
import { redisModule } from "./redis/redis.module";

export const appModule = new Rhythm({ name: "app" })
  .register(include(redisModule, ({ redis }) => ({ redis })))
  .register(decorate(() => ({ appService })))
  .use(mount(appController))
  .use(mount(productsModule));
