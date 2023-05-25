import puppeteer, { type Browser, type ElementHandle } from "puppeteer";
import { prisma } from "@/server/db";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { OpenAIService } from "@/lib/services/OpenAI.service";
import { MetricZodSchema } from "@/lib/schemas/coin.schema";

let browserPromise: Promise<Browser> | undefined;

export const WhitePaperService = {
  async getBrowser(): Promise<Browser> {
    if (process.env.NODE_ENV === "development") {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._browserPromise) {
        global._browserPromise = puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          ignoreDefaultArgs: ["--disable-extensions"],
        });
      }
      return global._browserPromise;
    }

    if (process.env.CRONJOB === "true") {
      if (!browserPromise) {
        browserPromise = puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          ignoreDefaultArgs: ["--disable-extensions"],
        });
      }
      return browserPromise;
    }

    throw Error(
      "PuppeteerHelper: getBrowser() is not available in non-cronjob mode"
    );
  },

  async getWhitePaper({
    browser,
    link,
    coinId,
  }: {
    coinId: number;
    link: string;
    browser: Browser;
  }) {
    const page = await browser.newPage();

    try {
      await page.goto(link, { waitUntil: "networkidle2", timeout: 30000 });

      // Find a link containing 'whitepaper' text and click it
      const whitepaperLink = await page.$x("//a[contains(., 'Whitepaper')]");
      if (whitepaperLink.length > 0) {
        const href = await (whitepaperLink[0] as ElementHandle).evaluate((el) =>
          el.getAttribute("href")
        );

        if (!href) {
          console.log("No links with 'whitepaper' found", link);
          await prisma.coin.update({
            where: {
              id: coinId,
            },
            data: {
              noWhitePaper: true,
            },
          });
          await page.close();
          return;
        }

        // navigate to the whitepaper link
        await page.goto(href, { waitUntil: "networkidle2", timeout: 30000 });

        // get the text
        const text = await page.evaluate(() => document.body.innerText);
        await prisma.coin.update({
          where: {
            id: coinId,
          },
          data: {
            whitePaper: text,
            whitePaperUrl: href,
          },
        });
      } else {
        console.log("No links with 'whitepaper' found", link);
        await prisma.coin.update({
          where: {
            id: coinId,
          },
          data: {
            noWhitePaper: true,
          },
        });
      }
    } catch (e) {
      console.log("Error: ", e);
    } finally {
      await page.close();
    }
  },

  async analyseWhitePaper(whitepaper: string) {
    // create a zod schema for the data we want to extract
    const type = `{
      "shortSummary": string;
      "regulation": boolean; // is the project regulated? does the project have a legal entity? does the project mention regulation in the whitepaper?
      "publicTeam": boolean; // is the team public? does the team have linkedin profiles? does the team have github profiles?
    }`;

    // const exampleWhitePaper = ``;
    // const exmapleResponse = ``;

    const prompt = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: `You are a high performing, crypto analyst, extracting the following data from whitepapers into the following typescript object: ${type}`,
        },
        // {
        //   role: ChatCompletionRequestMessageRoleEnum.User,
        //   content: exampleWhitePaper,
        // },
        // {
        //   role: ChatCompletionRequestMessageRoleEnum.Assistant,
        //   content: exmapleResponse,
        // },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: `whitepaper = ${whitepaper}`,
        },
      ],
      temperature: 0,
    };

    try {
      const extractedData = await OpenAIService.createChatCompletionWithType(
        prompt,
        MetricZodSchema
      );
      return { extractedData, prompt };
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
