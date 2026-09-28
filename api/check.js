import { keys } from "./_store.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { key } = req.query;
  if (!key) return res.status(400).json({ success: false, message: "Missing key" });

  const keyData = keys[key];
  if (!keyData) return res.status(404).json({ success: false, message: "Invalid key" });

  return res.status(200).json({
    status: "success",
    key: keyData.key,
    credit: keyData.credit,
    expired: keyData.expired,
    valid: true
  });
}
