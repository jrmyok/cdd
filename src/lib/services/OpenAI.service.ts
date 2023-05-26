import { Configuration, OpenAIApi } from "openai";
import { type CreateChatCompletionRequest } from "openai/api";

export const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export const OpenAIService = {
  async generateChatCompletion(
    prompt: CreateChatCompletionRequest
  ): Promise<string> {
    const response = await openai.createChatCompletion(prompt);
    return response.data.choices[0]?.message?.content?.trim() || "";
  },
};
