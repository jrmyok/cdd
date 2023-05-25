import { Configuration, OpenAIApi } from "openai";
import { type z } from "zod";
import { type CreateChatCompletionRequest } from "openai/api";

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export const OpenAIService = {
  async createChatCompletion(
    prompt: CreateChatCompletionRequest
  ): Promise<string> {
    const response = await openai.createChatCompletion(prompt);
    return response.data.choices[0]?.message?.content?.trim() || "";
  },

  async createChatCompletionWithType<T>(
    prompt: CreateChatCompletionRequest,
    zodSchema: z.ZodSchema<T>
  ): Promise<T> {
    try {
      const response = await this.createChatCompletion(prompt);
      const parsed = JSON.parse(response);
      return zodSchema.parse(parsed);
    } catch (error) {
      console.error("OpenAIHelper createChatCompletionWithType error", error);
      throw error;
    }
  },
};
