import { HttpError, filter } from "@rhythmjs/middleware/filter";
import { intercept } from "@rhythmjs/middleware/intercept";
import { validate } from "@rhythmjs/middleware/validate";
import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/context";
import { createNoteSchema, notesResponseSchema, updateNoteSchema } from "./notes.schema";
import type { NotesService } from "./notes.service";

export type NotesContext = RhythmHttpContext & {
  notesService: NotesService;
};

export const notesController = new RhythmRouter<NotesContext>()
  .use(filter())
  .use(intercept(notesResponseSchema))
  .get("/api/notes", async (ctx) => {
    ctx.json(await ctx.notesService.list());
  })
  .get("/api/notes/:id", async (ctx) => {
    const note = await ctx.notesService.get(ctx.params.id);
    if (!note) throw new HttpError(404, "Note not found");
    ctx.json(note);
  })
  .post("/api/notes", validate("body", createNoteSchema), async (ctx) => {
    ctx.json(await ctx.notesService.create(ctx.valid.body), 201);
  })
  .patch("/api/notes/:id", validate("body", updateNoteSchema), async (ctx) => {
    const note = await ctx.notesService.update(ctx.params.id, ctx.valid.body);
    if (!note) throw new HttpError(404, "Note not found");
    ctx.json(note);
  })
  .delete("/api/notes/:id", async (ctx) => {
    const removed = await ctx.notesService.remove(ctx.params.id);
    if (!removed) throw new HttpError(404, "Note not found");
    ctx.response.status = 204;
  });
