import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export interface ChatModel {
  model: LanguageModel;
  modelInfo: { id: string };
}

export const modelService = {
  create(id: string): ChatModel {
    return { model: openai(id), modelInfo: { id } };
  },
};
