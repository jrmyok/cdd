import {
  coinGeckoCoinListSchema,
  coinGeckoMarketDataSchema,
  type CoinSchema,
  type NewCoin,
  newCoinSchema,
} from "@/lib/schemas/coin.schema";
import { prisma } from "@/server/db";
import { logger } from "@/lib/logger";

const coinGeckoBase = process.env.COINGECKO_BASE_URL ?? "";
export const CoinDataService = {
  async getAllCoins() {
    return prisma.coin.findMany();
  },

  async addCoin(coin: NewCoin) {
    try {
      const parsedCoin = newCoinSchema.parse(coin);
      return await prisma.coin.create({
        data: { ...parsedCoin },
      });
    } catch (e: any) {
      // if unique constraint error, ignore
      if (e.code === "P2002") {
        logger.warn("[add coin] coin already exists", coin);
        return;
      }
      console.log("Failed to add coin to database", e);
      throw e;
    }
  },

  async getCoinList() {
    try {
      const response = await fetch(`${coinGeckoBase}/coins/list`);

      const data = await response.json();
      const parsedData = coinGeckoCoinListSchema.parse(data);
      return parsedData.map((coin) => {
        const { id: coinGeckoId, symbol: ticker, name } = coin;

        return {
          coinGeckoId,
          ticker,
          name,
        };
      });
    } catch (e) {
      console.log("Failed to fetch coin data from CoinGecko");
      throw e;
    }
  },

  async getCoinGeckoMarketDataByIds(ids: string[]) {
    // batch ids into groups of 100
    const batchedIds: string[][] = [];
    for (let i = 0; i < ids.length; i += 250) {
      batchedIds.push(ids.slice(i, i + 250));
    }

    const responses: any[] = [];
    let page = 1;
    for (const batch of batchedIds.slice(0, 2)) {
      try {
        logger.info(
          `[get coin gecko market data] batch ${page} of ${batchedIds.length} for ${batch.length} coins`
        );
        const response = await fetch(
          `${coinGeckoBase}/coins/markets?vs_currency=usd&ids=${batch.join(
            ","
          )}&page=${page}`
        );
        // check if we're being rate limited
        if (response.status === 429) {
          console.log("CoinGecko rate limit hit, waiting 5 minutes...");
          await new Promise((resolve) => setTimeout(resolve, 300000));
        }
        responses.push(await response.json());
        page++;
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } catch (e) {
        console.log("Failed to fetch coin data from CoinGecko");
        throw e;
      }
    }

    const coinData = responses.flat();
    const parsedCoinData = coinData.map((coin) => {
      try {
        return coinGeckoMarketDataSchema.parse(coin);
      } catch (e) {
        logger.warn("Failed to parse coin data", coin);
        return null;
      }
    });

    return parsedCoinData.map((coin) => {
      if (!coin) return null;
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
        lastUpdated: new Date(),
      },
    });
  },
};
