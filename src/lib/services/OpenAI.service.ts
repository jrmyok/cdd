import { baseLogger } from "@/lib/logger";
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { type CreateChatCompletionRequest } from "openai/api";
import { prisma } from "@/server/db";
import CoinDataService from "@/lib/services/Coin.service";
import { MetricZodSchema } from "@/lib/schemas/coin.schema";
import { type Coin } from "@prisma/client";

class OpenAIService {
  private openai;
  private logger;
  private coinDataService;

  constructor({ logger = baseLogger } = {}) {
    this.coinDataService = new CoinDataService({ logger });
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      })
    );
    this.logger = baseLogger.child({ service: "OpenAIService" });
  }

  private async generateChatCompletion(
    prompt: CreateChatCompletionRequest
  ): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion(prompt);
      return response.data.choices[0]?.message?.content?.trim() || "";
    } catch (e) {
      this.logger.error("Error generating chat completion", e);
      throw e;
    }
  }

  public async generateAnalysis() {
    const coins = await this.coinDataService.getAllWithWhitePaper();
    const promises: Promise<void>[] = [];
    for (const coin of coins.slice(10)) {
      if (!coin.whitePaper) continue;
      if (coin.metricId) continue;

      this.logger.info(`Getting openai analysis for ${coin.coinGeckoId}`);

      promises.push(this.getOpenAiAnalysis(coin));

      if (promises.length > 10) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    return await Promise.all(promises);
  }

  async analyseWhitePaper(whitepaper: string) {
    // create a zod schema for the data we want to extract
    const type = `{
      "summary": string | null; // is there a summary?
      "regulation": boolean; // is the project regulated? does the project have a legal entity? does the project mention regulation in the whitepaper? if nothing is mentioned assume false.
      "publicTeam": boolean; // is the team public? does the team have linkedin profiles? does the team have github profiles? if nothing is mentioned assume false.
    }`;

    // only github links in the whitepaper
    // const exampleWhitePaper = ``;
    const exampleObject = `{
      "summary": null,
      "regulation": false,
      "publicTeam": true
    }`;

    const prompt = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: `You are a crypto investment analyst, extracting the following data from whitepapers into the following typescript object: ${type}`,
        },
        // {
        //   role: ChatCompletionRequestMessageRoleEnum.User,
        //   content: exampleWhitePaper,
        // },
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: exampleObject,
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: `whitepaper = ${whitepaper}`,
        },
      ],
      temperature: 0,
    };

    try {
      const extractedData = await this.generateChatCompletion(prompt);
      try {
        const jsonObject = JSON.parse(extractedData);
        return MetricZodSchema.parse(jsonObject);
      } catch (error) {
        this.logger.error(
          `createChatCompletionWithType error, ${error}, ${extractedData}`
        );
        throw error;
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }

  private async getOpenAiAnalysis(coin: Coin) {
    try {
      const metrics = await this.analyseWhitePaper(coin.whitePaper as string);
      await prisma.coin.update({
        where: { id: coin.id },
        data: {
          metrics: {
            create: {
              summary: metrics.summary,
              regulation: metrics.regulation,
              publicTeam: metrics.publicTeam,
              whitePaper: true,
            },
          },
        },
      });
    } catch (e) {
      this.logger.error(
        `[openai analysis] error getting analysis for ${coin.coinGeckoId}`,
        e
      );
      return;
    }
  }
}

export default OpenAIService;
