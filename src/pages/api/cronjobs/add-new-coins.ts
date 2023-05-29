import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { newCoinSchema } from "@/lib/schemas/coin.schema";
import { logger as baseLogger } from "@/lib/logger";
import CoinDataService from "@/lib/services/Coin.service";

const logger = baseLogger("add-new-coins");

const coinDataService = new CoinDataService({ logger });

// run daily
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    logger.info("Fetching coin cache...");
    const currentCoinData = await coinDataService.getAllCoins();

    logger.info("Fetching all coin data from CoinGecko...");
    const allCoins = await coinDataService.getCoinList();

    const newCoins = allCoins.filter(
      (coin) =>
        !currentCoinData.some(
          (currentCoin) => currentCoin.coinGeckoId === coin.coinGeckoId
        )
    );

    // update prisma with new coins
    const response = await Promise.all(
      newCoins.map(async (coin) => {
        logger.info(`Adding ${coin.name}...`);

        const parsedCoin = newCoinSchema.parse(coin);
        await coinDataService.addCoin(parsedCoin);
      })
    );

    logger.info("added new coins", response);
    handleSuccess("added new coins", res, logger);
  } catch (e) {
    handleError("new coins job", e, res, logger);
  }
}
