import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { logger as baseLogger } from "@/lib/logger";
import WhitePaperService from "@/lib/services/Whitepaper.service";
import CoinDataService from "@/lib/services/Coin.service";

const logger = baseLogger("scrape-white-papers");

const whitePaperService = new WhitePaperService({
  logger,
});

const coinDataService = new CoinDataService({ logger });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // services/Whitepaper.service.js

    authenticate(req);

    const browser = await whitePaperService.getBrowser();

    const promises: Promise<void>[] = [];
    // get coins from prisma
    const coins = await coinDataService.getAllCoins();

    for (const coin of coins) {
      if (coin.noWhitePaper !== null) continue;
      logger.info(`Getting white paper for ${coin.coinGeckoId}`);

      const task = async () => {
        await whitePaperService.getWhitePaper({
          coinId: coin.id,
          browser,
          link:
            coin.whitePaperUrl ??
            `https://www.coingecko.com/en/coins/${coin.coinGeckoId}`,
        });
      };

      promises.push(task());

      if (promises.length > 3) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }

    await Promise.all(promises);

    logger.info("updated coin white papers");
    handleSuccess("white papers scraped", res, logger);
  } catch (e) {
    handleError("white paper scraper", e, res, logger);
  }
}
