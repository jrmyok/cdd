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

    for (const coin of coins) {
      // Fetch the coin metrics
      const metrics = await prisma.metric.findFirst({
        where: {
          id: coin.metricId ?? -1,
        },
      });

      if (!metrics) {
        logger.warn("Coin does not have associated metrics", coin);
        continue;
      }

      // Define weights for each metric
      const weights = {
        regulation: 0.33,
        publicTeam: 0.33,
        whitePaper: 0.33,
      };

      // Calculate risk score based on metric weights
      const riskScore =
        (metrics.regulation ? 0 : weights.regulation) +
        (metrics.publicTeam ? 0 : weights.publicTeam) +
        (metrics.whitePaper ? 0 : weights.whitePaper);

      // Save the risk level to the coin
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
