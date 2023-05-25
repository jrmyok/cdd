import { router } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";

// top level router
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
