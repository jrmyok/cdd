import puppeteer, { type Browser, type ElementHandle } from "puppeteer";
import { prisma } from "@/server/db";

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
      console.log(whitepaperLink[0]);
      if (whitepaperLink.length > 0) {
        const href = await (whitepaperLink[0] as ElementHandle).evaluate((el) =>
          el.getAttribute("href")
        );

        if (!href) {
          throw new Error("No href found for whitepaper link" + link);
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
      }
    } catch (e) {
      console.log("Error: ", e);
    } finally {
      await page.close();
    }

    // close the page
  },
};
