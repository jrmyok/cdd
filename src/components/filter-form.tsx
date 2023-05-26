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
        "col-span-1 flex flex-col gap-y-5 rounded-lg bg-gradient-to-br from-fuchsia-900 to-yellow-600 to-90% p-3 sm:py-5 sm:pl-5 sm:pr-7"
      }
    >
      <div className={"flex justify-between"}>
        <h1 className="col-span-3 text-base font-semibold leading-6 text-white">
          Filters 🔎
        </h1>
        {/* TODO */}
        <div className={"flex hidden items-center"}>
          <button
            className={"flex items-center justify-center rounded-lg "}
            type="button"
            onClick={() => {
              console.log("clicked");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-800"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 4C2 3.44772 2.44772 3 3 3H17C17.5523 3 18 3.44772 18 4C18 4.55228 17.5523 5 17 5H3C2.44772 5 2 4.55228 2 4ZM3 7H17C17.5523 7 18 7.44772 18 8C18 8.55228 17.5523 9 17 9H3C2.44772 9 2 8.55228 2 8C2 7.44772 2.44772 7 3 7ZM3 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11ZM3 15H17C17.5523 15 18 15.4477 18 16C18 16.5523 17.5523 17 17 17H3C2.44772 17 2 16.5523 2 16C2 15.4477 2.44772 15 3 15Z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        <label className="w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100">
          Coin Name
        </label>
        <input
          className={" w-full rounded-lg bg-gray-200 px-3 py-1 lg:px-4 "}
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
      </div>

      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        {" "}
        <label
          className="
 w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100"
        >
          Ticker
        </label>{" "}
        <input
          className={" w-full rounded-lg bg-gray-200 px-3 py-1 lg:px-4 "}
          type="text"
          placeholder="BTC"
          value={state.ticker}
          onChange={(e) =>
            handleInputChange(e.target.value, filterActions.SET_TICKER)
          }
        />
        {errorState.ticker && (
          <p className="text-xs text-red-500">{errorState.ticker}</p>
        )}
      </div>

      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        {" "}
        <label
          className="
 w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100"
        >
          Min Market Cap
        </label>{" "}
        <div className="relative  w-full">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 transform  text-gray-400">
            $
          </span>
          <input
            className="w-full rounded-lg bg-gray-200 px-3 py-1 pl-6 lg:pl-5 "
            type="number"
            placeholder="Min Market Cap"
            value={state.minMarketCap || ""}
            onChange={(e) => {
              let inputValue: string | null = e.target.value;
              if (inputValue === "") {
                inputValue = null;
              }
              handleInputChange(
                inputValue ?? "",
                filterActions.SET_MIN_MARKET_CAP
              );
            }}
          />
        </div>
        {errorState.minMarketCap && (
          <p className="text-xs text-red-500">{errorState.minMarketCap}</p>
        )}
      </div>

      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        <label
          className="
 w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100"
        >
          Max Market Cap
        </label>{" "}
        <div className="relative  w-full">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 transform  text-gray-400">
            $
          </span>
          <input
            className="w-full rounded-lg bg-gray-200 px-3 py-1 pl-6 lg:pl-5 "
            type="number"
            placeholder="Max Market Cap"
            value={state.maxMarketCap || ""}
            onChange={(e) => {
              let inputValue: string | null = e.target.value;
              if (inputValue === "") {
                inputValue = null;
              }
              handleInputChange(
                inputValue ?? "",
                filterActions.SET_MAX_MARKET_CAP
              );
            }}
          />
        </div>
        {errorState.maxMarketCap && (
          <p className="text-xs text-red-500">{errorState.maxMarketCap}</p>
        )}
      </div>

      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        {" "}
        <label
          className="
 w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100"
        >
          Min Risk Level
        </label>{" "}
        <input
          className={" w-full rounded-lg bg-gray-200 px-3 py-1 lg:px-4 "}
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
      </div>

      <div className={"flex items-center gap-1 lg:flex-col lg:items-start"}>
        {" "}
        <label
          className="
 w-1/2 whitespace-nowrap text-xs font-semibold text-gray-100"
        >
          Max Risk Level
        </label>{" "}
        <input
          className={" w-full rounded-lg bg-gray-200 px-3 py-1 lg:px-4"}
          type="number"
          placeholder="Max Risk Level"
          value={state.maxRiskLevel}
          onChange={(e) =>
            handleInputChange(e.target.value, filterActions.SET_MAX_RISK_LEVEL)
          }
        />
        {errorState.maxRiskLevel && (
          <p className="text-xs text-red-500">{errorState.maxRiskLevel}</p>
        )}
      </div>
    </form>
  );
};
