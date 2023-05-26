import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useEffect, useReducer } from "react";
import useDebounce from "@/components/hooks/useDebounce";
import { filterActions, filterReducer } from "@/components/reducers/filters";

export default function Table() {
  const { data: coins, isLoading } = trpc.coin.getCoinsByFilter.useQuery({
    take: 20,
    skip: 0,
  });

  const [state, dispatch] = useReducer(filterReducer, {
    name: "",
    ticker: "",
    minMarketCap: "",
    maxMarketCap: "",
    minRiskLevel: "",
    maxRiskLevel: "",
  });

  const debouncedState = useDebounce(state, 500);

  useEffect(() => {
    // Run your query with the debounced values
  }, [debouncedState]);

  const router = useRouter();
  return (
    <div className="w-full">
      <div className="w-full flex-col sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-white">
            A list of available coins with verified data
          </h1>
          <p className="mt-2 text-sm text-gray-300"></p>
        </div>
        <div className="mt-4 w-full lg:grid lg:grid-cols-4 lg:gap-4">
          <form
            className={
              "col-span-1 flex flex-col gap-y-5 rounded-lg bg-gray-800 p-3 sm:pl-5 sm:pr-7"
            }
          >
            <h1 className="col-span-3 text-base font-semibold leading-6 text-white">
              Filters 🔎
            </h1>
            <input
              className={"w-full rounded-lg px-4 py-2"}
              type="text"
              placeholder="Coin Name"
              value={state.name}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_NAME,
                  payload: e.target.value,
                })
              }
            />
            <input
              className={"w-full rounded-lg px-4 py-2"}
              type="text"
              placeholder="Ticker"
              value={state.ticker}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_TICKER,
                  payload: e.target.value,
                })
              }
            />
            <input
              className={"w-full rounded-lg px-4 py-2"}
              type="number"
              placeholder="Min Market Cap"
              value={state.minMarketCap}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_MIN_MARKET_CAP,
                  payload: e.target.value,
                })
              }
            />
            <input
              className={"w-full rounded-lg px-4 py-2"}
              type="number"
              placeholder="Max Market Cap"
              value={state.maxMarketCap}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_MAX_MARKET_CAP,
                  payload: e.target.value,
                })
              }
            />
            <input
              className={"w-full rounded-lg px-4 py-2"}
              type="number"
              placeholder="Min Risk Level"
              value={state.minRiskLevel}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_MIN_RISK_LEVEL,
                  payload: e.target.value,
                })
              }
            />
            <input
              type="number"
              className={"w-full rounded-lg px-4 py-2"}
              placeholder="Max Risk Level"
              value={state.maxRiskLevel}
              onChange={(e) =>
                dispatch({
                  type: filterActions.SET_MAX_RISK_LEVEL,
                  payload: e.target.value,
                })
              }
            />
          </form>

          <div className=" col-span-3 mt-4 flow-root  overflow-y-scroll rounded-lg bg-gray-700 px-5 lg:-ml-6 lg:mt-0 lg:overflow-x-scroll lg:rounded-l-none">
            <div className="relative -mx-4 -mb-2   sm:-mx-6 lg:-mx-8">
              <div className="inline-block max-h-96 min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full border-separate border-spacing-0 divide-y divide-gray-700 ">
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
                          <tr
                            key={i}
                            className="cursor-pointer hover:bg-stone-800"
                          >
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
