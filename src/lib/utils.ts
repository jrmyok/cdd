import { logger } from "@/lib/logger";
import { type NextApiRequest, type NextApiResponse } from "next";

export function authenticate(req: NextApiRequest) {
  const { secret } = req.headers;
  console.log("auth secret", secret);
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  logger.info(`${req.method}: ${req.url}`);
  if (secret !== process.env.SECRET && process.env.NODE_ENV !== "development") {
    throw new Error("Unauthorized");
  }
}

export function handleError(taskName: string, err: any, res: NextApiResponse) {
  const msg = `❌ ${taskName} task failed with error: ${err}`;
  if (err instanceof Error) {
    res.status(400).json(msg);
  } else {
    res.status(500).send(msg);
  }
  logger.error(err, msg);
}

export function handleSuccess(
  taskName: string,
  res: NextApiResponse,
  customMessage?: any
) {
  const msg = `✅ ${taskName} task completed successfully`;

  logger.info(msg);
  if (customMessage) {
    logger.info(customMessage);
    res.status(200).send(customMessage);
  } else {
    res.status(200).send(msg);
  }
}
