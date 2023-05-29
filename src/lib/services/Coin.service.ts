import {
  coinGeckoCoinListSchema,
  coinGeckoMarketDataSchema,
  type CoinSchema,
  type NewCoin,
  newCoinSchema,
} from "@/lib/schemas/coin.schema";
import { prisma } from "@/server/db";
import { baseLogger } from "@/lib/logger";
import fetch from "node-fetch";

class CoinDataService {
  private readonly coinGeckoBase: string;
  private readonly logger: any;

  constructor({ logger = baseLogger } = {}) {
    this.logger = logger.child({ service: "CoinDataService" });
    this.coinGeckoBase = process.env.COINGECKO_BASE_URL ?? "";
  }

  public async getAllCoins() {
    return prisma.coin.findMany({
      orderBy: {
        marketCap: "desc",
      },
    });
  }

  public async getAllWithWhitePaper(): Promise<CoinSchema[]> {
    return prisma.coin.findMany({
      where: {
        noWhitePaper: false,
        whitePaper: {
          not: null,
        },
      },
    });
  }

  public async addCoin(coin: NewCoin): Promise<CoinSchema | void> {
    try {
      const parsedCoin = newCoinSchema.parse(coin);
      return await prisma.coin.create({
        data: { ...parsedCoin },
      });
    } catch (e: any) {
      // if unique constraint error, ignore
      if (e.code === "P2002") {
        this.logger.warn("coin already exists", coin);
        return;
      }
      this.logger.error("Failed to add coin to database", e);
      throw e;
    }
  }

  public async getCoinList() {
    try {
      const response = await fetch(`${this.coinGeckoBase}/coins/list`, {
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
      this.logger.error("Failed to fetch coin data from CoinGecko");
      throw e;
    }
  }

  async delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  public async fetchCoinData(page: number, ids: string[]) {
    if (ids.length > 250) {
      throw new Error("CoinGecko API only allows 250 coins per request");
    }

    const url = `${
      this.coinGeckoBase
    }/coins/markets?vs_currency=usd&order=market_cap_desc&ids=${ids.join(
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
          this.logger.warn("CoinGecko rate limit hit, waiting 10 seconds...");
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
  }

  public async updateCoinDataByIds(ids: string[]) {
    // Batch ids into groups of 250
    const batchedIds: string[][] = [];
    for (let i = 0; i < ids.length; i += 250) {
      batchedIds.push(ids.slice(i, i + 250));
    }

    for (const [index, batch] of batchedIds.entries()) {
      try {
        this.logger.info(
          `Fetching batch ${index + 1} of ${batchedIds.length} for ${
            batch.length
          } coins`
        );

        const coins = await this.fetchCoinData(index + 1, batch);
        const parsedCoinData = coins.map((coin) => {
          try {
            return coinGeckoMarketDataSchema.parse(coin);
          } catch (e) {
            this.logger.warn("Failed to parse coin data", coin, e);
            return null;
          }
        });

        for (const coin of parsedCoinData) {
          this.logger.info(`Updating ${coin?.symbol}`, {
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
        this.logger.error(`Failed to fetch or update coin data ${e}`);
      }

      // Wait for 7 seconds between batches
      await this.delay(7000);
    }
  }

  private async updateCoin(coin: CoinSchema) {
    return prisma.coin.update({
      where: {
        coinGeckoId: coin.coinGeckoId,
      },
      data: {
        ...coin,
        lastUpdated: new Date(),
      },
    });
  }
}

export default CoinDataService;
