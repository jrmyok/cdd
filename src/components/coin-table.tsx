import { type FC } from "react";
import { useRouter } from "next/router";
import { type Coin, type Metric } from "@prisma/client";
import Pagination from "@/components/table-pagination";
import Image from "next/image";
import { trpc } from "@/lib/trpc";

interface CoinTableProps {
  coins: (Coin & { metrics: Metric })[];
  isLoading: boolean;
}

export const CoinTable: FC<CoinTableProps> = ({ coins, isLoading }) => {
  const router = useRouter();

  const { data: coinCount } = trpc.coin.countCoins.useQuery();
  return (
    <div className="w-fill col-span-3 mt-4 flow-root  overflow-x-scroll rounded-lg bg-gray-900 px-5 lg:-ml-6 lg:mt-0 lg:rounded-l-none">
      <div
        style={{
          height: "calc(100vh - 200px)",
        }}
        className=" -mx-4 -mb-2     sm:-mx-6 lg:-mx-8"
      >
        <div className=" relative inline-block h-full min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full border-separate border-spacing-0 divide-y divide-gray-700 overflow-y-hidden">
            <thead>
              <tr>
                <th
                  scope="col"
                  className=" min-w-6 min-h-6  sticky top-0 z-10 border-b border-gray-500 bg-gray-900 bg-opacity-90 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-4"
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 hidden border-b border-gray-500 bg-gray-900 bg-opacity-90 px-3 py-3.5 text-left text-sm font-semibold text-white lg:table-cell"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-900 bg-opacity-90 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Ticker
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-900 bg-opacity-90 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Market Cap (USD)
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-900 bg-opacity-90 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Current Price (USD)
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-900 bg-opacity-90 px-3 py-3.5 text-left text-sm font-semibold text-white "
                >
                  Change(%)
                </th>
              </tr>
            </thead>
            <tbody className=" divide-y divide-gray-800">
              {!isLoading && coins
                ? coins.map((coin) => (
                    <tr
                      key={coin.ticker}
                      onClick={() => {
                        router.push(`/protected/coin/${coin?.id}`);
                      }}
                      className="cursor-pointer rounded-lg px-3 transition duration-300 ease-in-out hover:bg-fuchsia-800/50 hover:shadow-md hover:shadow-fuchsia-700 hover:ring hover:ring-fuchsia-500/20   lg:hover:bg-gradient-to-bl lg:hover:from-fuchsia-800/5 lg:hover:to-fuchsia-800"
                    >
                      <td className="flex-nowrap whitespace-nowrap rounded-l-lg py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-4">
                        {coin.image &&
                        coin.image.includes("assets.coingecko.com") ? (
                          <Image
                            className="min-w-6 min-h-6 inline-block rounded-full "
                            src={coin.image}
                            alt=""
                            width={24}
                            height={24}
                          />
                        ) : (
                          <div className="inline-block h-6 w-6 rounded-full bg-gray-500"></div>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-300 lg:block">
                        {coin.name}
                      </td>
                      <td className="whitespace-nowrap  px-3 py-4 text-sm text-gray-300">
                        {coin.ticker.toUpperCase()}
                      </td>
                      <td className="whitespace-nowrap  px-3 py-4  text-sm text-gray-300">
                        ${coin.marketCap?.toLocaleString("en-US")}
                      </td>
                      <td className="whitespace-nowrap  px-3 py-4 text-sm text-gray-300">
                        ${coin.price}
                      </td>
                      <td className="whitespace-nowrap rounded-r-lg  px-3 py-4 text-sm text-gray-300">
                        {coin.percentChange?.toFixed(3)}%
                      </td>
                    </tr>
                  )) // loading
                : Array.from(Array(20).keys()).map((i) => (
                    <tr key={i} className="cursor-pointer  hover:bg-stone-800">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        <div className="min-w-6 min-h-6 inline-block rounded-full bg-gray-500"></div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        <div
                          className={`h-4 w-full animate-pulse bg-gray-500/50`}
                        ></div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        <div
                          className={`h-4 w-full animate-pulse bg-gray-500`}
                        ></div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        <div
                          className={`h-4 w-full animate-pulse bg-gray-500`}
                        ></div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        <div
                          className={`h-4 w-full animate-pulse bg-gray-500`}
                        ></div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <Pagination
            currentPage={
              router.query.page ? parseInt(router.query.page as string) : 1
            }
            totalPages={coinCount ? Math.ceil(coinCount / 20) : 1}
            onPageChange={(page) => {
              router.push(`/protected/?page=${page}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
