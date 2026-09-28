// api/index.js
export default async function handler(req, res) {
  const { url, method } = req;
  const parsed = new URL(url, `http://${req.headers.host}`);
  const path = parsed.pathname;
  const params = parsed.searchParams;

  const ADMIN_KEY = "admin_564cf20e1a424606a20b149ee3965598";
  const EXTERNAL_API = "https://techgen.agency/free/nid.php";

  // In-memory store (production e database use koro)
  global.keys = global.keys || {};

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  // ---------- CREATE KEY ----------
  if (path.endsWith("/createkey")) {
    const admin = params.get("admin");
    const credit = parseInt(params.get("credit") || "0");
    const expired = params.get("expired") || null;

    if (admin !== ADMIN_KEY) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const key = "key_" + crypto.randomUUID().replace(/-/g, "");
    global.keys[key] = { key, credit, expired };

    return res.status(200).json({
      status: "success",
      key,
      credit,
      expired
    });
  }

  // ---------- PREMIUM ----------
  if (path.endsWith("/premium")) {
    const key = params.get("key");
    const nid = params.get("nid");
    const dob = params.get("dob");

    if (!key || !nid || !dob) {
      return res.status(400).json({ success: false, message: "Missing key, nid or dob" });
    }

    const keyData = global.keys[key];
    if (!keyData) {
      return res.status(401).json({ success: false, message: "Invalid key" });
    }
    if (keyData.credit <= 0) {
      return res.status(403).json({ success: false, message: "No credit left" });
    }
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

  // ---------- CHECK ----------
  if (path.endsWith("/check")) {
    const key = params.get("key");
    if (!key) return res.status(400).json({ success: false, message: "Missing key" });

    const keyData = global.keys[key];
    if (!keyData) return res.status(404).json({ success: false, message: "Invalid key" });

    return res.status(200).json({
      status: "success",
      key: keyData.key,
      credit: keyData.credit,
      expired: keyData.expired,
      valid: true
    });
  }

  // ---------- DELETE ----------
  if (path.endsWith("/delete")) {
    const key = params.get("key");
    if (!key) return res.status(400).json({ success: false, message: "Missing key" });

    delete global.keys[key];

    return res.status(200).json({
      status: "success",
      message: "Key deleted",
      key
    });
  }

  return res.status(404).json({ error: "Endpoint not found" });
}
