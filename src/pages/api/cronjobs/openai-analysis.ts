import { type NextApiRequest, type NextApiResponse } from "next";
import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { CoinDataService } from "@/lib/services/Coin.service";
import { WhitePaperService } from "@/lib/services/Whitepaper.service";
import { prisma } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);
    const coins = await CoinDataService.getAllWithWhitePaper();
    const promises: Promise<void>[] = [];
    for (const coin of coins.slice(10)) {
      if (!coin.whitePaper) continue;
      if (coin.metricId) continue;

      logger.info("Getting openai analysis for", coin.coinGeckoId);

      async function getOpenAiAnalysis() {
        const metrics = await WhitePaperService.analyseWhitePaper(
          coin.whitePaper as string
        );
        await prisma.coin.update({
          where: { id: coin.id },
          data: {
            metrics: {
              create: {
                ...metrics.extractedData,
                whitePaper: true,
              },
            },
          },
        });
      }
      promises.push(getOpenAiAnalysis());

      if (promises.length > 10) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    await Promise.all(promises);

    logger.info("[openai analysis] updated coin white papers");
    handleSuccess("openai analysis updated", res);
  } catch (e) {
    handleError("openai analysis", e, res);
  }
}
