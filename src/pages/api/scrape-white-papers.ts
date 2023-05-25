import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { WhitePaperService } from "@/lib/services/Whitepaper.service";
import { logger } from "@/lib/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    const browser = await WhitePaperService.getBrowser();
    const text = await WhitePaperService.getWhitePaper({
      browser,
      link: "https://www.coingecko.com/en/coins/3-kingdoms-multiverse",
    });

    console.log("text", text);

    // console.log("Fetching coin cache...");
    // const currentCoinData = await CoinDataService.getAllCoins();
    //
    // const coinGeckoIds = currentCoinData.map((coin) => coin.coinGeckoId);
    // console.log("Fetching coin data from CoinGecko...");
    // const updatedData = await CoinDataService.getCoinGeckoMarketDataByIds(
    //   coinGeckoIds
    // );
    // // update prisma
    // const response = await Promise.all(
    //   updatedData.map(async (coin) => {
    //     console.log(`Updating ${coin.name}...`);
    //
    //     const parsedCoin = coinSchema.parse(coin);
    //     await CoinDataService.updateCoin(parsedCoin);
    //   })
    // );
    logger.info("[white paper scraper] updated coin white papers");
    handleSuccess("white papers scraped", res);

    const msg = `✅ white paper open ai job`;
  } catch (e) {
    handleError("white paper scraper", e, res);
  }
}
