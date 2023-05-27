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
    return prisma.coin.findMany({
      orderBy: {
        marketCap: "desc",
      },
    });
  },

  async getAllWithWhitePaper() {
    return prisma.coin.findMany({
      where: {
        noWhitePaper: false,
        whitePaper: {
          not: null,
        },
      },
    });
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
      const response = await fetch(`${coinGeckoBase}/coins/list`, {
        headers: {
          "Content-Type": "application/json",
          "x-cg-pro-api-key": process.env.COINGECKO_API_KEY ?? "",
        },
      });

      const data = await response.json();
      const parsedData = coinGeckoCoinListSchema.parse(data);
      const filteredCoinData = parsedData.filter(
        (coin) => coin.symbol && coin.symbol.length <= 6
      );

      return filteredCoinData
        .map((coin) => {
          const { id: coinGeckoId, symbol: ticker, name } = coin;

          return {
            coinGeckoId,
            ticker,
            name,
          };
        })
        .filter(
          (coin, index, self) =>
            coin &&
            coin.ticker.length <= 6 &&
            self.findIndex(
              (c) =>
                c.coinGeckoId === coin.coinGeckoId && c.ticker === coin.ticker
            ) === index
        );
    } catch (e) {
      console.log("Failed to fetch coin data from CoinGecko");
      throw e;
    }
  },

  async delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },

  async fetchCoinData(page: number, ids: string[]) {
    if (ids.length > 250) {
      throw new Error("CoinGecko API only allows 250 coins per request");
    }

    const url = `${coinGeckoBase}/coins/markets?vs_currency=usd&order=market_cap_desc&ids=${ids.join(
      ","
    )}&per_page=${ids.length}`;

    while (true) {
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "x-cg-pro-api-key": process.env.COINGECKO_API_KEY ?? "",
          },
        });

        if (response.status === 429) {
          console.log("CoinGecko rate limit hit, waiting 10 seconds...");
          await this.delay(10000);
          continue;
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.length) {
          throw new Error(`No data returned from CoinGecko, ${url}`);
        }

        return data;
      } catch (e: any) {
        console.error(`Failed to fetch coin data: ${e.message}`);
        throw e;
      }
    }
  },

  async updateCoinDataByIds(ids: string[]) {
    // Batch ids into groups of 250
    const batchedIds: string[][] = [];
    for (let i = 0; i < ids.length; i += 250) {
      batchedIds.push(ids.slice(i, i + 250));
    }

    for (const [index, batch] of batchedIds.entries()) {
      try {
        logger.info(
          `[get coin gecko market data] Fetching batch ${index + 1} of ${
            batchedIds.length
          } for ${batch.length} coins`
        );

        const coins = await this.fetchCoinData(index + 1, batch);
        const parsedCoinData = coins.map((coin) => {
          try {
            return coinGeckoMarketDataSchema.parse(coin);
          } catch (e) {
            logger.warn("Failed to parse coin data", coin, e);
            return null;
          }
        });

        for (const coin of parsedCoinData) {
          logger.info(`[get coin gecko market data] Updating ${coin?.symbol}`, {
            coin,
          });
          if (!coin) continue;

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

          await this.updateCoin({
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
          });
        }
      } catch (e) {
        logger.error(`Failed to fetch or update coin data ${e}`);
      }

      // Wait for 7 seconds between batches
      await this.delay(7000);
    }
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
