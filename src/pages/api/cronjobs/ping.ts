// test ping auth
import { authenticate } from "@/lib/utils";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    authenticate(req);

    res.status(200).json({ message: "pong" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}
