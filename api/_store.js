export const EXTERNAL_API = "https://techgen.agency/free/nid.php";

export const PLANS = {
  TNEH: {
    prefix: "TNEH",
    dailyCredit: 50,
    unlimited: false,
    days: null
  },
  NOMAN1: {
    prefix: "NOMAN1",
    dailyCredit: null,
    unlimited: true,
    days: 30
  }
};

// In-memory store (global so it survives within a single function instance)
global._keys = global._keys || {};

export const keys = global._keys;

// Pre-registered keys (hardcoded)
keys["TNEH_DEMO123"] = {
  key: "TNEH_DEMO123",
  credit: 50,
  expired: "2026-12-31",
  lastReset: null
};

keys["NOMAN1_DEMO456"] = {
  key: "NOMAN1_DEMO456",
  credit: 0,
  expired: null,
  lastReset: null
};
