import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { CoinDataService } from "@/lib/services/Coin.service";
import { prisma } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);
    const coins = await CoinDataService.getAllCoins();

    // max values required for normalization
    const maxMarketCap = Math.max(...coins.map((coin) => coin.marketCap || 0));
    const maxVolume = Math.max(...coins.map((coin) => coin.totalVolume || 0));
    const maxCirculatingSupply = Math.max(
      ...coins.map((coin) => coin.circulatingSupply || 0)
    );
    const maxTotalSupply = Math.max(
      ...coins.map((coin) => coin.totalSupply || 0)
    );

    for (const coin of coins) {
      const metrics = await prisma.metric.findFirst({
        where: {
          id: coin.metricId ?? -1,
        },
      });

      if (!metrics) {
        logger.warn("Coin does not have associated metrics", coin);
        continue;
      }

      const weights = {
        regulation: 0.1,
        publicTeam: 0.1,
        whitePaper: 0.1,
        marketCap: 0.2,
        totalVolume: 0.2,
        circulatingSupply: 0.15,
        totalSupply: 0.15,
      };

      // Metrics with numeric values are normalized (divided by the max value)
      // and then subtracted from 1 to make them contribute more when they're lower
      const riskScore =
        (metrics.regulation ? 0 : weights.regulation) +
        (metrics.publicTeam ? 0 : weights.publicTeam) +
        (metrics.whitePaper ? 0 : weights.whitePaper) +
        (1 - (coin.marketCap || 0) / maxMarketCap) * weights.marketCap +
        (1 - (coin.totalVolume || 0) / maxVolume) * weights.totalVolume +
        (1 - (coin.circulatingSupply || 0) / maxCirculatingSupply) *
          weights.circulatingSupply +
        (1 - (coin.totalSupply || 0) / maxTotalSupply) * weights.totalSupply;

      await prisma.coin.update({
        where: { id: coin.id },
        data: { riskLevel: riskScore },
      });
    }

    logger.info("[risk analysis] updated coin white papers");
    handleSuccess("risk analysis updated", res);
  } catch (e) {
    handleError("risk analysis", e, res);
  }
}
