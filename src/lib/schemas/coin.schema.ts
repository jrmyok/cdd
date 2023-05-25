import z from "zod";

export const coinSchema = z.object({
  coinGeckoId: z.string(),
  ticker: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  price: z.number().nullable(),
  percentChange: z.number().nullable(),
  marketCap: z.number().nullable(),
  totalVolume: z.number().nullable(),
  circulatingSupply: z.number().nullable(),
  totalSupply: z.number().nullable(),
});

export const MetricZodSchema = z.object({
  regulation: z.boolean(),
  publicTeam: z.boolean(),
});

export const newCoinSchema = z.object({
  coinGeckoId: z.string(),
  ticker: z.string(),
  name: z.string(),
});

export type NewCoin = z.infer<typeof newCoinSchema>;

export const coinGeckoCoinListSchema = z.array(
  z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
  })
);

export const coinGeckoMarketDataSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number().nullable().optional(),
  market_cap: z.number().nullable().optional(),
  market_cap_rank: z.number().nullable().optional(),
  fully_diluted_valuation: z.number().nullable().optional(),
  total_volume: z.number().nullable().optional(),
  high_24h: z.number().nullable().optional(),
  low_24h: z.number().nullable().optional(),
  price_change_24h: z.number().nullable().optional(),
  price_change_percentage_24h: z.number().nullable().optional(),
  market_cap_change_24h: z.number().nullable().optional(),
  market_cap_change_percentage_24h: z.number().nullable().optional(),
  circulating_supply: z.number().nullable().optional(),
  total_supply: z.number().nullable().optional(),
  max_supply: z.number().nullable().optional(),
  ath: z.number().nullable().optional(),
  ath_change_percentage: z.number().nullable().optional(),
  ath_date: z.string().nullable().optional(),
  atl: z.number().nullable().optional(),
  atl_change_percentage: z.number().nullable(),
  atl_date: z.string().nullable(),
  roi: z
    .object({
      times: z.number().nullable(),
      currency: z.string().nullable(),
      percentage: z.number().nullable(),
    })
    .nullable()
    .optional(),
  last_updated: z.string().nullable().optional(),
});

export type CoinSchema = z.infer<typeof coinSchema>;

export type CoinGeckoMarketDataSchema = z.infer<
  typeof coinGeckoMarketDataSchema
>;

export type CoinGeckoCoinListSchema = z.infer<typeof coinGeckoCoinListSchema>;
