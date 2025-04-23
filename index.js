require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { generateApplePass } = require("./apple_pass/generate");
//const { generateGoogleWalletPass } = require("./google_pass/generate");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🚀 LynkMe Wallet Pass Generator is live!");
});

// ✅ Main endpoint: generate pass based on platform
app.get("/generate-pass", async (req, res) => {
  const { platform, name, title, referrer } = req.query;

  if (!platform || !name || !title || !referrer) {
    return res.status(400).json({
      error: "Missing required query parameters: platform, name, title, referrer",
    });
  }

  try {
    if (platform === "ios") {
      const passBuffer = await generateApplePass({ name, title, referrer });
      res.set({
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename=${name}_lynkme.pkpass`,
      });
      return res.send(passBuffer);
    }

    if (platform === "android") {
      const saveUrl = await generateGoogleWalletPass({ name, title, referrer });
      return res.redirect(saveUrl); // Opens Google Wallet URL
    }

    return res.status(400).json({ error: "Invalid platform. Use 'ios' or 'android'." });

  } catch (err) {
    console.error("❌ Error generating pass:", err);
    return res.status(500).json({ error: "Failed to generate pass." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
