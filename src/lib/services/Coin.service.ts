import {
  coinGeckoMarketDataSchema,
  type CoinSchema,
} from "@/lib/schemas/coin.schema";
import { prisma } from "@/server/db";

const coinGeckoBase = process.env.COINGECKO_BASE_URL ?? "";
export const CoinDataService = {
  async getAllCoins() {
    return prisma.coin.findMany();
  },

  async getCoinGeckoMarketData(ids: string[]) {
    // batch ids into groups of 100
    const batchedIds: string[][] = [];
    for (let i = 0; i < ids.length; i += 100) {
      batchedIds.push(ids.slice(i, i + 100));
    }

    const responses: any[] = [];
    let page = 1;
    for (const batch of batchedIds) {
      try {
        const response = await fetch(
          `${coinGeckoBase}/coins/markets?vs_currency=usd&ids=${batch.join(
            ","
          )}&page=${page}`
        );
        responses.push(await response.json());
        page++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.log("Failed to fetch coin data from CoinGecko");
        throw e;
      }
    }

    const coinData = responses.flat();
    const parsedCoinData = coinGeckoMarketDataSchema.parse(coinData);
    return parsedCoinData.map((coin) => {
      const {
        id: coinGeckoId,
        symbol: ticker,
        name,
        image,
        current_price: price,
        price_change_percentage_24h: percentChange,
        market_cap: marketCap,
        total_volume: totalVolume,
        circulating_supply: circulatingSupply,
        total_supply: totalSupply,
      } = coin;

      return {
        coinGeckoId,
        ticker,
        name,
        image,
        price,
        percentChange,
        marketCap,
        totalVolume,
        circulatingSupply,
        totalSupply,
      };
    });
  },

  async updateCoin(coin: CoinSchema) {
    return prisma.coin.update({
      where: {
        coinGeckoId: coin.coinGeckoId,
      },
      data: {
        ...coin,
      },
    });
  },
};
