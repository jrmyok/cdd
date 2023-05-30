import { useRouter } from "next/router";
import { useReducer } from "react";
import useDebounce from "@/components/hooks/useDebounce";
import { filterActions, filterReducer } from "@/components/reducers/filters";
import { trpc } from "@/lib/trpc";
import { CoinTable } from "@/components/coin-table";
import { FilterForm } from "@/components/filter-form";
import { type Filter } from "@/lib/schemas/coin.schema";

export default function Table() {
  const initialErrorState = {
    name: null,
    ticker: null,
    minMarketCap: null,
    maxMarketCap: null,
    minRiskLevel: null,
    maxRiskLevel: null,
  };

  const [state, dispatch] = useReducer(filterReducer, {
    name: "",
    ticker: "",
    minMarketCap: "",
    maxMarketCap: "",
    minRiskLevel: "",
    maxRiskLevel: "",
    noWhitePaper: "",
  });

  const debouncedState = useDebounce(state, 500);

  const [errorState, errorDispatch] = useReducer(
    filterReducer,
    initialErrorState
  );

  const router = useRouter();
  const page = Number(router.query.page) || 1;

  const filter = getFilter(debouncedState);

  const { data: coins, isLoading } = trpc.coin.getCoinsByFilter.useQuery({
    take: 20,
    skip: (page - 1) * 20,
    filter,
  });

  const handleInputChange = (value, actionType) => {
    let payload = value;
    let error: null | string = null;

    // Check if it's a numerical action type
    if (
      [
        filterActions.SET_MIN_MARKET_CAP,
        filterActions.SET_MAX_MARKET_CAP,
        filterActions.SET_MIN_RISK_LEVEL,
        filterActions.SET_MAX_RISK_LEVEL,
      ].includes(actionType)
    ) {
      const numValue = Number(value);

      // If the value cannot be converted to a number, set an error
      if (Number.isNaN(numValue)) {
        error = "Please enter a valid number";
      } else {
        payload = numValue;
      }
    }

    dispatch({ type: actionType, payload });
    errorDispatch({ type: actionType, payload: error });
  };

  return (
    <div className="w-full bg-black">
      <div className="w-full flex-col space-y-4  sm:items-center  ">
        <div className="rounded-lg border border-white/5 bg-gray-400/10 px-4 py-6 sm:flex-auto  sm:px-6 lg:px-8">
          <h1 className="text-base font-semibold leading-6 text-white">
            A list of available coins with verified data
          </h1>
          <p className="text-sm text-gray-300">
            Data is updated every 15 minutes.
          </p>
        </div>
        <div className=" w-full lg:grid lg:grid-cols-4 lg:gap-4">
          <FilterForm
            state={state}
            errorState={errorState}
            handleInputChange={handleInputChange}
          />
          <CoinTable coins={coins ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

const getFilter = (debouncedState) => {
  const filter: Filter = {
    name: debouncedState.name
      ? { contains: debouncedState.name, mode: "insensitive" }
      : undefined,
    ticker: debouncedState.ticker
      ? { contains: debouncedState.ticker, mode: "insensitive" }
      : undefined,
    marketCap: {
      gte: debouncedState.minMarketCap
        ? Number(debouncedState.minMarketCap)
        : undefined,
      lte: debouncedState.maxMarketCap
        ? Number(debouncedState.maxMarketCap)
        : undefined,
    },
    riskLevel: {
      gte: debouncedState.minRiskLevel
        ? Number(debouncedState.minRiskLevel)
        : undefined,
      lte: debouncedState.maxRiskLevel
        ? Number(debouncedState.maxRiskLevel)
        : undefined,
    },
    noWhitePaper: debouncedState.noWhitePaper ? false : undefined,
  };

  if (debouncedState.summary) {
    filter["metrics"] = {
      summary: {
        not: null,
      },
    };
  }

  return filter;
};
