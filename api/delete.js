import { keys } from "./_store.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { key } = req.query;
  if (!key) return res.status(400).json({ success: false, message: "Missing key" });

  delete keys[key];

  return res.status(200).json({
    status: "success",
    message: "Key deleted",
    key
  });
}
