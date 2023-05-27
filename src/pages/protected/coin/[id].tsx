import Layout from "@/components/protected-layout";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/router";
import classNames from "classnames";

type Stat = {
  name: string;
  value: number;
  unit: string;
};

export default function CoinPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: coin, isLoading } = trpc.coin.getCoin.useQuery({
    id: Number(id),
  });

  if (isLoading) return <Layout>Loading...</Layout>;
  if (!coin) return <Layout>404</Layout>;

  // create an object from coin called stats, where each element is an object with a name and value from coin
  const validStats = [
    "marketCap",
    "riskLevel",
    "price",
    "percentChange",
    "circulatingSupply",
    "totalSupply",
    "volume",
  ];

  const titles = {
    marketCap: "Market Cap",
    riskLevel: "Risk Level",
    price: "Price",
    percentChange: "Price Change",
    circulatingSupply: "Circulating Supply",
    totalSupply: "Total Supply",
  };

  const stats: Stat[] = Object.entries(coin)
    .map(([name, value]): Stat | null => {
      if (!validStats.includes(name)) return null;
      return {
        name,
        value,
        unit:
          name === "marketCap"
            ? "USD"
            : name === "riskLevel"
            ? "out of 100"
            : ""
            ? "USD"
            : name === "price"
            ? "USD"
            : name === "percentChange"
            ? "%"
            : name === "circulatingSupply"
            ? "coins"
            : name === "totalSupply"
            ? "coins"
            : name === "volume"
            ? "USD"
            : "",
      };
    })
    .filter((stat): stat is Stat => Boolean(stat));

  return (
    <Layout>
      <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-x-3">
            <h1 className="flex gap-x-3 text-base leading-7">
              <div className="h-8 w-8 flex-none rounded-full bg-gray-800">
                {coin.image && (
                  <img src={coin.image} className="h-8 w-8 rounded-full" />
                )}
              </div>
              <span className="font-semibold text-white">
                {coin?.name?.charAt(0).toUpperCase() + coin?.name?.slice(1)}
              </span>
            </h1>
          </div>
          <p className="mt-2 text-xs leading-6 text-gray-400">
            {coin.lastUpdated && (
              <span>
                Last updated: {new Date(coin.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        {!coin.noWhitePaper ? (
          <a
            className={classNames(
              "order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none"
            )}
            href={coin.whitePaperUrl as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            Whitepaper
          </a>
        ) : (
          <div
            className={classNames(
              "order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none",
              "bg-red-400/10 text-red-400"
            )}
          >
            No Whitepaper
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2  lg:grid-cols-3">
        {stats.slice(0, 3).map((stat, statIdx) => (
          <div
            key={titles[stat.name]}
            className={classNames(
              statIdx % 2 === 1
                ? "sm:border-l"
                : statIdx === 2
                ? "lg:border-l"
                : "",
              "border-t border-white/5 px-4 py-6 sm:px-6 lg:px-8"
            )}
          >
            <p className="text-sm font-medium leading-6 text-gray-400">
              {titles[stat.name]}
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {stat.value?.toLocaleString() ?? "N/A"}
              </span>
              {stat.unit ? (
                <span className="text-sm text-gray-400">{stat.unit}</span>
              ) : null}{" "}
            </p>
          </div>
        ))}
        {stats.slice(3, 6).map((stat, statIdx) => (
          <div
            key={stat.name}
            className={classNames(
              statIdx % 2 === 1
                ? "sm:border-l"
                : statIdx === 2
                ? "lg:border-l"
                : "",
              "border-t border-white/5 px-4 py-6 sm:px-6 lg:px-8"
            )}
          >
            <p className="text-sm font-medium leading-6 text-gray-400">
              {titles[stat.name]}
            </p>
            <p className="mt-2 flex items-baseline gap-x-2">
              <span className="text-4xl font-semibold tracking-tight text-white">
                {stat.value?.toLocaleString() ?? "N/A"}
              </span>
              {stat.unit ? (
                // if unit is percent, check value for positive or negative and add appropriate color
                <span className="text-sm text-gray-400">{stat.unit}</span>
              ) : null}{" "}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 max-w-3xl">
        <h2 className="font-semibold text-gray-500">Powered By OpenAI</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Short Summary
        </p>
        <p className="mt-4 text-gray-500">
          {coin.metrics?.summary ?? "No summary available"}
        </p>
      </div>
    </Layout>
  );
}
