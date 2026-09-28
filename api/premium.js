import { keys, EXTERNAL_API } from "./_store.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { key, nid, dob } = req.query;

  if (!key || !nid || !dob) {
    return res.status(400).json({ success: false, message: "Missing key, nid or dob" });
  }

  const keyData = keys[key];
  if (!keyData) return res.status(401).json({ success: false, message: "Invalid key" });
  if (keyData.credit <= 0) return res.status(403).json({ success: false, message: "No credit left" });
  if (keyData.expired && new Date(keyData.expired) < new Date()) {
    return res.status(403).json({ success: false, message: "Key expired" });
  }

  try {
    const apiRes = await fetch(`${EXTERNAL_API}?nid=${nid}&dob=${dob}`);
    const data = await apiRes.json();

    delete data.owner;
    delete data.telegram;

    keyData.credit -= 1;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: "API call failed", error: err.message });
  }
    }
