import type { MikroORM } from "@mikro-orm/postgresql";
import { HttpError, filter } from "@rhythmjs/middleware/filter";
import { Rhythm } from "@rhythmjs/rhythm";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { notesModule } from "./notes/notes.module";

export const appModule = new Rhythm<RhythmHttpContext, { orm: MikroORM }>({ name: "app", type: "module" })
  .use(filter())
  .register(notesModule)
  .use(() => {
    throw new HttpError(404, "Route not found");
  });
