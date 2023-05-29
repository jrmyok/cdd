import { authenticate, handleError, handleSuccess } from "@/lib/utils";
import { type NextApiRequest, type NextApiResponse } from "next";
import { logger as baseLogger } from "@/lib/logger";
import OpenAIService from "@/lib/services/OpenAI.service";

const logger = baseLogger("openai-analysis");
const openAiService = new OpenAIService({ logger });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);
    await openAiService.generateAnalysis();
    handleSuccess("risk analysis updated", res, logger);
  } catch (e) {
    handleError("risk analysis", e, res, logger);
  }
}
