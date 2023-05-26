import { type FC } from "react";
import { useRouter } from "next/navigation";
import { type Coin, type Metric } from "@prisma/client";
import Pagination from "@/components/table-pagination";

interface CoinTableProps {
  coins: (Coin & { metrics: Metric })[];
  isLoading: boolean;
}

export const CoinTable: FC<CoinTableProps> = ({ coins, isLoading }) => {
  const router = useRouter();
  return (
    <div className="w-fill col-span-3 mt-4 flow-root  rounded-lg bg-gray-700 px-5 lg:-ml-6 lg:mt-0 lg:overflow-x-scroll lg:rounded-l-none">
      <div
        style={{
          height: "calc(100vh - 200px)",
        }}
        className=" -mx-4 -mb-2     sm:-mx-6 lg:-mx-8"
      >
        <div className=" relative inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="  min-w-full border-separate border-spacing-0 divide-y divide-gray-700 overflow-y-hidden">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-700 bg-opacity-80 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-700 bg-opacity-80 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Ticker
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-700 bg-opacity-80 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Market Cap (USD)
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-700 bg-opacity-80 px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Current Price (USD)
                </th>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b border-gray-500 bg-gray-700 bg-opacity-80 px-3 py-3.5 text-left text-sm font-semibold text-white "
                >
                  Change(%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {!isLoading && coins
                ? coins.map((coin) => (
                    <tr
                      key={coin.ticker}
                      onClick={() => {
                        router.push(`/protected/coin/${coin?.id}`);
                      }}
                      className="cursor-pointer hover:bg-stone-800"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {coin.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {coin.ticker.toUpperCase()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        ${coin.marketCap?.toLocaleString("en-US")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        ${coin.price}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {coin.percentChange?.toFixed(3)}%
                      </td>
                    </tr>
                  )) // loading
                : Array.from(Array(10).keys()).map((i) => (
                    <tr key={i} className="cursor-pointer hover:bg-stone-800">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        loading...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        loading...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        loading...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        loading...
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={(page) => {
              router.push(`/?page=${page}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};
