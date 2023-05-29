import { protectedProcedure, router } from "../trpc";
import z from "zod";
import { GetCoinSchema } from "@/lib/schemas/coin.schema";

export const coinRouter = router({
  countCoins: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.coin.count();
  }),

  getCoin: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.coin.findUnique({
        where: {
          id: input.id,
        },
        include: {
          metrics: true,
        },
      });
    }),

  getCoinsByFilter: protectedProcedure
    .input(GetCoinSchema)
    .query(({ ctx, input }) => {
      const filter = Object.assign(input.filter || {}, {
        ...input.filter,
        marketCap: {
          ...input.filter?.marketCap,
          not: null,
        },
      });
      return ctx.prisma.coin.findMany({
        where: {
          ...filter,
          name: {
            contains: input.filter?.name?.contains,
            startsWith: input.filter?.name?.startsWith,
            mode: "insensitive",
          },
          ticker: {
            contains: input.filter?.ticker?.contains,
            startsWith: input.filter?.ticker?.startsWith,
            mode: "insensitive",
          },
        },
        include: {
          metrics: true,
        },
        orderBy: {
          [input.orderBy?.field || "marketCap"]:
            input.orderBy?.direction || "desc",
        },
        skip: input.skip,
        take: input.take,
      });
    }),
});
