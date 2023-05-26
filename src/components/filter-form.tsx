import { type FC } from "react";
import { filterActions } from "@/components/reducers/filters";

// Define the type for the properties expected by the component
interface FilterFormProps {
  state: {
    name: string;
    ticker: string;
    minMarketCap: string;
    maxMarketCap: string;
    minRiskLevel: string;
    maxRiskLevel: string;
  };
  errorState: {
    name: string | null;
    ticker: string | null;
    minMarketCap: string | null;
    maxMarketCap: string | null;
    minRiskLevel: string | null;
    maxRiskLevel: string | null;
  };
  handleInputChange: (value: string, actionType) => void;
}

// Define the FilterForm component
export const FilterForm: FC<FilterFormProps> = ({
  state,
  errorState,
  handleInputChange,
}) => {
  return (
    <form
      className={
        "col-span-1 flex flex-col gap-y-5 rounded-lg bg-gray-800 p-3 sm:py-5 sm:pl-5 sm:pr-7"
      }
    >
      <h1 className="col-span-3 text-base font-semibold leading-6 text-white">
        Filters 🔎
      </h1>
      <input
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        type="text"
        placeholder="Coin Name"
        value={state.name}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_NAME)
        }
      />
      {errorState.name && (
        <p className="text-xs text-red-500">{errorState.name}</p>
      )}
      <input
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        type="text"
        placeholder="Ticker"
        value={state.ticker}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_TICKER)
        }
      />
      {errorState.ticker && (
        <p className="text-xs text-red-500">{errorState.ticker}</p>
      )}

      <input
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        type="number"
        placeholder="Min Market Cap"
        value={state.minMarketCap}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_MIN_MARKET_CAP)
        }
      />
      {errorState.minMarketCap && (
        <p className="text-xs text-red-500">{errorState.minMarketCap}</p>
      )}

      <input
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        type="number"
        placeholder="Max Market Cap"
        value={state.maxMarketCap}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_MAX_MARKET_CAP)
        }
      />
      {errorState.maxMarketCap && (
        <p className="text-xs text-red-500">{errorState.maxMarketCap}</p>
      )}

      <input
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        type="number"
        placeholder="Min Risk Level"
        value={state.minRiskLevel}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_MIN_RISK_LEVEL)
        }
      />
      {errorState.minRiskLevel && (
        <p className="text-xs text-red-500">{errorState.minRiskLevel}</p>
      )}

      <input
        type="number"
        className={"w-full rounded-lg bg-gray-100 px-4 py-2"}
        placeholder="Max Risk Level"
        value={state.maxRiskLevel}
        onChange={(e) =>
          handleInputChange(e.target.value, filterActions.SET_MAX_RISK_LEVEL)
        }
      />
      {errorState.maxRiskLevel && (
        <p className="text-xs text-red-500">{errorState.maxRiskLevel}</p>
      )}
    </form>
  );
};
