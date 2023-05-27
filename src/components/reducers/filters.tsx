export const filterActions = {
  SET_NAME: "SET_NAME",
  SET_TICKER: "SET_TICKER",
  SET_MIN_MARKET_CAP: "SET_MIN_MARKET_CAP",
  SET_MAX_MARKET_CAP: "SET_MAX_MARKET_CAP",
  SET_MIN_RISK_LEVEL: "SET_MIN_RISK_LEVEL",
  SET_MAX_RISK_LEVEL: "SET_MAX_RISK_LEVEL",
  SET_WHITE_PAPER: "SET_WHITE_PAPER",
  SET_SUMMARY: "SET_SUMMARY",
};

export const filterReducer = (state, action) => {
  switch (action.type) {
    case filterActions.SET_NAME:
      return { ...state, name: action.payload };
    case filterActions.SET_TICKER:
      return { ...state, ticker: action.payload };
    case filterActions.SET_MIN_MARKET_CAP:
      return { ...state, minMarketCap: action.payload };
    case filterActions.SET_MAX_MARKET_CAP:
      return { ...state, maxMarketCap: action.payload };
    case filterActions.SET_MIN_RISK_LEVEL:
      return { ...state, minRiskLevel: action.payload };
    case filterActions.SET_MAX_RISK_LEVEL:
      return { ...state, maxRiskLevel: action.payload };
    case filterActions.SET_WHITE_PAPER:
      return { ...state, noWhitePaper: action.payload };
    case filterActions.SET_SUMMARY:
      return { ...state, summary: action.payload };
    default:
      throw new Error();
  }
};
