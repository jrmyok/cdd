import z from "zod";

export const coinSchema = z.object({
  coinGeckoId: z.string(),
  ticker: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  percentChange: z.number(),
  marketCap: z.number(),
  totalVolume: z.number(),
  circulatingSupply: z.number(),
  totalSupply: z.number(),
});

export const coinGeckoMarketDataSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    image: z.string(),
    current_price: z.number(),
    market_cap: z.number(),
    market_cap_rank: z.number(),
    fully_diluted_valuation: z.number(),
    total_volume: z.number(),
    high_24h: z.number(),
    low_24h: z.number(),
    price_change_24h: z.number(),
    price_change_percentage_24h: z.number(),
    market_cap_change_24h: z.number(),
    market_cap_change_percentage_24h: z.number(),
    circulating_supply: z.number(),
    total_supply: z.number(),
    max_supply: z.number(),
    ath: z.number(),
    ath_change_percentage: z.number(),
    ath_date: z.string(),
    atl: z.number(),
    atl_change_percentage: z.number(),
    atl_date: z.string(),
    roi: z.null().optional(),
    last_updated: z.string(),
  })
);

export type CoinSchema = z.infer<typeof coinSchema>;

export type CoinGeckoMarketDataSchema = z.infer<
  typeof coinGeckoMarketDataSchema
>;
