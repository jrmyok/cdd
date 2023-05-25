import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { genSalt, hash } from "bcryptjs";

export const userRouter = router({
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const salt = await genSalt(10);
        const hashedPassword = await hash(input.password, salt);
        const email = input.email.toLowerCase();

        const user = await ctx.prisma.user.findFirst({
          where: {
            email,
          },
        });

        // TODO: throw a more generic error, otherwise security issue.
        if (user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already exists",
          });
        }

        const response = await ctx.prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
          },
        });

        return response;
      } catch (e: any) {
        throw new TRPCError(e);
      }
    }),
});
