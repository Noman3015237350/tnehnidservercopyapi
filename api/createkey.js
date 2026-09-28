import { keys, ADMIN_KEY } from "./_store.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { admin, credit, expired } = req.query;

  if (admin !== ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const key = "key_" + crypto.randomUUID().replace(/-/g, "");
  keys[key] = {
    key,
    credit: parseInt(credit || "0"),
    expired: expired || null
  };

  return res.status(200).json({
    status: "success",
    key,
    credit: keys[key].credit,
    expired: keys[key].expired
  });
    }
