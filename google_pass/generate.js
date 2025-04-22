const { JWT } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, "../certs/google-service-account.json")));

const generateGoogleWalletPass = async ({ name, title, referrer }) => {
  const audience = "google";
  const issuerId = process.env.GOOGLE_ISSUER_ID;
  const classId = `${issuerId}.lynkme_card`;
  const objectId = `${issuerId}.${name.toLowerCase().replace(/\s/g, "_")}_pass`;

  const payload = {
    iss: serviceAccount.client_email,
    aud: audience,
    origins: [],
    typ: "savetowallet",
    payload: {
      genericObjects: [
        {
          id: objectId,
          classId,
          cardTitle: { defaultValue: { language: "en-US", value: name } },
          subheader: { defaultValue: { language: "en-US", value: title } },
          header: { defaultValue: { language: "en-US", value: "LynkMe Card" } },
          barcode: {
            type: "QR_CODE",
            value: `https://lynkmesmartcards.com${referrer}`,
          },
          hexBackgroundColor: "#000000"
        }
      ]
    }
  };

  const jwtClient = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"]
  });

  const token = await jwtClient.sign(payload);
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
  return saveUrl;
};

module.exports = { generateGoogleWalletPass };
