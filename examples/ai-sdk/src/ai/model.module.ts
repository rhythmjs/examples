import { openai } from "@ai-sdk/openai";
import { configModule } from "@rhythmjs/config";
import { Rhythm, decorate, include } from "@rhythmjs/rhythm";
import type { LanguageModel } from "ai";
import { load } from "../config/ai.config";

export interface ChatModel {
  model: LanguageModel;
  modelInfo: { id: string };
}

export const modelService = {
  create(id: string): ChatModel {
    return { model: openai(id), modelInfo: { id } };
  },
};

// The config loads when the module is evaluated, so a bad value fails at startup, before the server listens.
export const modelModule = new Rhythm({ name: "model" })
  .register(include(await configModule.forRoot(...load), ({ configService }) => ({ configService })))
  .register(decorate(({ configService }) => modelService.create(configService.get("ai.model"))));
