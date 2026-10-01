import { mkdir } from "node:fs/promises";
import { multipart, type MultipartContext } from "@rhythmjs/http/multipart";
import { RhythmRouter } from "@rhythmjs/router";
import type { RhythmHttpContext } from "@rhythmjs/router/adapters/context";
import type { S3Client } from "bun";
import type { appService } from "./app.service";

export type AppContext = RhythmHttpContext & {
  appService: typeof appService;
  s3: S3Client;
};

const uploadDir = () => process.env.UPLOAD_DIR ?? "uploads";
const ALLOWED_IMAGES = new Set(["image/png", "image/jpeg"]);
const limits = multipart({ maxBytes: 5 * 1024 * 1024, maxFileSize: 2 * 1024 * 1024, maxFiles: 1 });

export const appController = new RhythmRouter<AppContext>()
  .get("/", (ctx) => {
    ctx.response.headers.set("content-type", "text/plain");
    ctx.response.body = ctx.appService.getHello();
  })
  .post<MultipartContext>("/avatar", limits, async (ctx) => {
    const file = ctx.form.file("avatar");
    if (!file) {
      ctx.error(400, "avatar missing");
      return;
    }
    if (!ALLOWED_IMAGES.has(file.type)) {
      ctx.error(415, "avatar must be a PNG or JPEG");
      return;
    }

    const key = `${crypto.randomUUID()}.${file.type === "image/png" ? "png" : "jpg"}`;
    await mkdir(uploadDir(), { recursive: true });
    await Bun.write(`${uploadDir()}/${key}`, file);
    ctx.json({ key, size: file.size, url: `/avatar/${key}` }, 201);
  })
  .get("/avatar/:key", async (ctx) => {
    const file = Bun.file(`${uploadDir()}/${ctx.params.key}`);
    if (!/^[0-9a-f-]{36}\.(png|jpg)$/.test(ctx.params.key) || !(await file.exists())) {
      ctx.error(404, "Not found");
      return;
    }

    ctx.response.headers.set("content-type", ctx.params.key.endsWith(".png") ? "image/png" : "image/jpeg");
    ctx.response.body = file;
  })
  .post<MultipartContext>("/documents", limits, async (ctx) => {
    const file = ctx.form.file("document");
    if (!file) {
      ctx.error(400, "document missing");
      return;
    }

    const key = `documents/${crypto.randomUUID()}`;
    await ctx.s3.write(key, file, { type: file.type });
    ctx.json({ key, size: file.size, url: ctx.s3.presign(key, { expiresIn: 3600 }) }, 201);
  });
