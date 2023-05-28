import puppeteer, { type Browser, type ElementHandle } from "puppeteer";
import { prisma } from "@/server/db";
import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { OpenAIService } from "@/lib/services/OpenAI.service";
import { MetricZodSchema } from "@/lib/schemas/coin.schema";
import { logger } from "@/lib/logger";

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
        console.log("launching puppeteer");
        browserPromise = puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          ignoreDefaultArgs: ["--disable-extensions"],
        });
      } else {
        console.log("browserPromise already exists");
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
          throw Error("No links with 'whitepaper' found");
        }

        // navigate to the whitepaper link
        await page.goto(href, { waitUntil: "networkidle2", timeout: 30000 });

        // check if the page is a pdf
        const isPdf = await page.evaluate(() => {
          return (
            document.contentType === "application/pdf" ||
            document.contentType === "x-google-chrome-pdf"
          );
        });

        if (isPdf) {
          logger.info(
            `Whitepaper is a pdf, skipping..., ${href} ${document.body}`
          );
          return;
        }
        // get the text
        const text = await page.evaluate(() => document.body.innerText);
        await prisma.coin.update({
          where: {
            id: coinId,
          },
          data: {
            // for now, mark the coin as having a whitepaper
            noWhitePaper: false,
            whitePaper: text,
            whitePaperUrl: href,
          },
        });
      } else {
        throw Error("No links with 'whitepaper' found");
      }
    } catch (e: any) {
      if (e.message.includes("No links with 'whitepaper' found")) {
        logger.warn("No links with 'whitepaper' found", link);
        await prisma.coin.update({
          where: {
            id: coinId,
          },
          data: {
            noWhitePaper: true,
          },
        });
      } else {
        logger.error(`Error in getWhitePaper, ${e.message}, ${link}`);
        throw e;
      }
    } finally {
      logger.info(`closing page for ${link}`);
      await page.close();
    }
  },

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
      const extractedData = await OpenAIService.generateChatCompletion(prompt);
      try {
        const jsonObject = JSON.parse(extractedData);
        return MetricZodSchema.parse(jsonObject);
      } catch (error) {
        console.error(
          "OpenAIHelper createChatCompletionWithType error",
          error,
          extractedData
        );
        throw error;
      }
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
