import { keys, EXTERNAL_API, PLANS } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { key, nid, dob } = req.query;

  if (!key || !nid || !dob) {
    return res.status(400).json({
      success: false,
      message: "Missing key, nid or dob"
    });
  }

  // Detect plan type
  let plan = null;
  if (key.startsWith("TNEH")) plan = PLANS.TNEH;
  else if (key.startsWith("NOMAN1")) plan = PLANS.NOMAN1;

  if (!plan) {
    return res.status(401).json({
      success: false,
      message: "Invalid key prefix. Use TNEH or NOMAN1"
    });
  }

  const keyData = keys[key];
  if (!keyData) {
    return res.status(401).json({ success: false, message: "Invalid key" });
  }

  const today = new Date().toISOString().split("T")[0];

  // Expiry check
  if (keyData.expired && new Date(keyData.expired) < new Date()) {
    return res.status(403).json({ success: false, message: "Key expired" });
  }

  // ---------- TNEH: 50 credit per day ----------
  if (plan.prefix === "TNEH") {
    if (keyData.lastReset !== today) {
      keyData.credit = plan.dailyCredit;
      keyData.lastReset = today;
    }

    if (keyData.credit <= 0) {
      return res.status(403).json({
        success: false,
        message: "Daily credit limit reached. Try tomorrow."
      });
    }
  }

  // ---------- NOMAN1: unlimited, 30 day ----------
  if (plan.prefix === "NOMAN1") {
    if (!keyData.expired) {
      const exp = new Date();
      exp.setDate(exp.getDate() + plan.days);
      keyData.expired = exp.toISOString().split("T")[0];
    }
  }

  try {
    const apiRes = await fetch(`${EXTERNAL_API}?nid=${nid}&dob=${dob}`);
    const data = await apiRes.json();

    delete data.owner;
    delete data.telegram;

    if (plan.prefix === "TNEH") {
      keyData.credit -= 1;
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "API call failed",
      error: err.message
    });
  }
}
