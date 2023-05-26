import { router } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { coinRouter } from "./coin";

// top level router
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  coin: coinRouter,
});

export type AppRouter = typeof appRouter;
