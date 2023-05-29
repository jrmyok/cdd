import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { logger as baseLogger } from "@/lib/logger";
import CoinDataService from "@/lib/services/Coin.service";

const logger = baseLogger("update-coin-data");

const coinDataService = new CoinDataService({ logger });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    logger.info("Fetching coin cache...");
    const currentCoinData = await coinDataService.getAllCoins();
    const outdatedCoins = currentCoinData.filter((coin) => {
      const now = new Date();
      const coinDate = new Date(coin.lastUpdated);
      const diff = (now.getTime() - coinDate.getTime()) / 1000 / 60;
      return diff > 15;
    });

    logger.info("Filtered coins...");
    const coinGeckoIds = outdatedCoins.map((coin) => coin.coinGeckoId);
    logger.info("Updating coin data from CoinGecko...");
    await coinDataService.updateCoinDataByIds(coinGeckoIds);
    logger.info("updated coin data");
    handleSuccess("update coin data", res, logger);
  } catch (e) {
    handleError("update coin data", e, res, logger);
  }
}
