import puppeteer, { type Browser, type ElementHandle } from "puppeteer";

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

  async getWhitePaper({ browser, link }: { link: string; browser: Browser }) {
    const page = await browser.newPage();
    await page.goto(link, { waitUntil: "networkidle2", timeout: 30000 });

    // Find a link containing 'whitepaper' text and click it
    const whitepaperLink = await page.$x("//a[contains(., 'whitepaper')]");
    if (whitepaperLink.length > 0) {
      await (whitepaperLink[0] as ElementHandle).click();
      await page.waitForNavigation({ waitUntil: "networkidle0" });

      // Extract and save the text from the new page
      const text = await page.evaluate(() => document.body.innerText);
      console.log(text);
    } else {
      console.log("No links with 'whitepaper' found");
    }

    // close the page
    await page.close();
  },
};
