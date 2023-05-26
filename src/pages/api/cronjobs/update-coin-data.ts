import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { CoinDataService } from "@/lib/services/Coin.service";
import { logger } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    console.log("Fetching coin cache...");
    const currentCoinData = await CoinDataService.getAllCoins();
    const outdatedCoins = currentCoinData.filter((coin) => {
      const now = new Date();
      const coinDate = new Date(coin.lastUpdated);
      const diff = (now.getTime() - coinDate.getTime()) / 1000 / 60;
      return diff > 15;
    });

    console.log("Filtered coins...");
    const coinGeckoIds = outdatedCoins.map((coin) => coin.coinGeckoId);
    console.log("Updating coin data from CoinGecko...");
    await CoinDataService.updateCoinDataByIds(coinGeckoIds);
    logger.info("[update coin data] updated coin data");
    handleSuccess("update coin data", res);
  } catch (e) {
    handleError("update coin data", e, res);
  }
}
