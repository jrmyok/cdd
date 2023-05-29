import { type NextApiRequest, type NextApiResponse } from "next";
import { baseLogger } from "@/lib/logger";

export function authenticate(req: NextApiRequest, logger = baseLogger) {
  const { "x-secret-key": secret } = req.body;
  console.log(process.env.CRONJOB_SECRET_KEY, secret, req.body);
  if (
    !process.env.CRONJOB_SECRET_KEY ||
    secret !== process.env.CRONJOB_SECRET_KEY
  ) {
    throw new Error("Unauthorized");
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  logger.info(`${req.method}: ${req.url}`);
}

export function handleError(
  taskName: string,
  err: any,
  res: NextApiResponse,
  logger = baseLogger
) {
  const msg = `job failed: ${err}`;
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
  customMessage?: any,
  logger = baseLogger
) {
  const msg = `job completed successfully`;

  logger.info(msg);
  if (customMessage) {
    logger.info(customMessage);
    res.status(200).send(customMessage);
  } else {
    res.status(200).send(msg);
  }
}
