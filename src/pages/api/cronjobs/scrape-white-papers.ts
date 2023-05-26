import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { WhitePaperService } from "@/lib/services/Whitepaper.service";
import { logger } from "@/lib/logger";
import { CoinDataService } from "@/lib/services/Coin.service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);
    const browser = await WhitePaperService.getBrowser();

    const promises: Promise<void>[] = [];
    // get coins from prisma
    const coins = await CoinDataService.getAllCoins();

    for (const coin of coins) {
      if (coin.noWhitePaper !== null) continue;
      logger.info(`Getting white paper for ${coin.coinGeckoId}`);

      const task = async () => {
        await WhitePaperService.getWhitePaper({
          coinId: coin.id,
          browser,
          link:
            coin.whitePaperUrl ??
            `https://www.coingecko.com/en/coins/${coin.coinGeckoId}`,
        });
      };

      promises.push(task());

      if (promises.length > 5) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }

    await Promise.all(promises);

    logger.info("[white paper scraper] updated coin white papers");
    handleSuccess("white papers scraped", res);
  } catch (e) {
    handleError("white paper scraper", e, res);
  }
}
