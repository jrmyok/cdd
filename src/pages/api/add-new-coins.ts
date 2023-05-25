import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { CoinDataService } from "@/lib/services/Coin.service";
import { newCoinSchema } from "@/lib/schemas/coin.schema";
import { logger } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    console.log("Fetching coin cache...");
    const currentCoinData = await CoinDataService.getAllCoins();

    console.log("Fetching all coin data from CoinGecko...");
    const allCoins = await CoinDataService.getCoinList();

    const newCoins = allCoins.filter(
      (coin) =>
        !currentCoinData.some(
          (currentCoin) => currentCoin.coinGeckoId === coin.coinGeckoId
        )
    );

    // update prisma with new coins
    const response = await Promise.all(
      newCoins.map(async (coin) => {
        console.log(`Adding ${coin.name}...`);

        const parsedCoin = newCoinSchema.parse(coin);
        await CoinDataService.addCoin(parsedCoin);
      })
    );

    logger.info("[add new coins] added new coins", response);
    handleSuccess("added new coins", res);

    const msg = `✅ new coins job`;
  } catch (e) {
    handleError(" new coins job", e, res);
  }
}
