import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { CoinDataService } from "@/lib/services/Coin.service";
import { coinSchema } from "@/lib/schemas/coin.schema";
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
      return diff > 5;
    });
    console.log("Filtered coins...");

    const coinGeckoIds = outdatedCoins.map((coin) => coin.coinGeckoId);
    console.log("Fetching coin data from CoinGecko...");
    const updatedData = await CoinDataService.getCoinGeckoMarketData(
      coinGeckoIds
    );
    // update prisma
    const response = await Promise.all(
      updatedData.map(async (coin) => {
        console.log(`Updating ${coin.name}...`);

        const parsedCoin = coinSchema.parse(coin);
        await CoinDataService.updateCoin(parsedCoin);
      })
    );
    logger.info("[update coin data] updated coin data", response);
    handleSuccess("update coin data", res);

    const msg = `✅ updated coin data`;
  } catch (e) {
    handleError("update coin data", e, res);
  }
}
