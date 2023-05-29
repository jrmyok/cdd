import puppeteer, { type Browser, type ElementHandle } from "puppeteer";
import { baseLogger } from "@/lib/logger";
import { prisma } from "@/server/db";

class WhitePaperService {
  private browserPromise: Promise<Browser> | undefined;
  private logger: any;

  constructor({ logger = baseLogger } = {}) {
    this.logger = logger.child({ service: "WhitePaperService" });

    if (process.env.CRONJOB === "true") {
      if (!this.browserPromise) {
        this.logger.info("launching puppeteer");
        this.browserPromise = puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          ignoreDefaultArgs: ["--disable-extensions"],
        });
      } else {
        this.logger.info("browserPromise already exists");
      }
    }
  }

  public async getBrowser(): Promise<Browser> {
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

    if (this.browserPromise) {
      return this.browserPromise;
    }

    throw Error(
      "PuppeteerHelper: getBrowser() is not available in non-cronjob mode"
    );
  }

  public async getWhitePaper({
    browser,
    link,
    coinId,
  }: {
    coinId: number;
    link: string;
    browser: Browser;
  }) {
    const page = await browser.newPage();
    // set page to not load images and css
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        ["image", "stylesheet", "font"].indexOf(request.resourceType()) !== -1
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        await page.goto(link, { waitUntil: "networkidle2", timeout: 30000 });

        // Find a link containing 'whitepaper' text and click it
        const whitepaperLink = await page.$x("//a[contains(., 'Whitepaper')]");
        if (whitepaperLink.length > 0) {
          const href = await (whitepaperLink[0] as ElementHandle).evaluate(
            (el) => el.getAttribute("href")
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
            this.logger.info(
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
        break;
      } catch (e: any) {
        if (
          e.message.includes("No links with 'whitepaper' found") ||
          e.message.includes("net::ERR_NAME_NOT_RESOLVED")
        ) {
          this.logger.warn(`No links with 'whitepaper' found ${link}`);
          await prisma.coin.update({
            where: {
              id: coinId,
            },
            data: {
              noWhitePaper: true,
            },
          });
          break;
        } else {
          this.logger.error(`Error in getWhitePaper, ${e.message}, ${link}`);
          retries++;
        }
      }
    }
    this.logger.info(`closing page for ${link}`);
    await page.close();

    if (retries >= maxRetries) {
      await prisma.coin.update({
        where: {
          id: coinId,
        },
        data: {
          noWhitePaper: true,
        },
      });
      this.logger.error(
        `Failed to set up lifecycle events after multiple attempts. ${link}`
      );
    }
  }
}

export default WhitePaperService;
