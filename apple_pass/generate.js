const path = require("path");
const { PKPass } = require("passkit-generator");

async function generateApplePass({ name, title, referrer }) {
  const pass = new PKPass(
    {
      model: path.join(__dirname, "template.pass")
    },
    {
      certificates: {
        wwdr: path.resolve(__dirname, "../certs/wwdr.pem"),
        signerCert: path.resolve(__dirname, "../certs/certificate.pem"),
        signerKey: {
          keyFile: path.resolve(__dirname, "../certs/key-nopass.pem"),
          passphrase: ""
        }
      },
      passTypeIdentifier: "pass.com.lynkme.businesscard",
      teamIdentifier: "YOUR_TEAM_ID"
    }
  );

  pass.fields.primaryFields.add({ key: "name", label: "Name", value: name });
  pass.fields.secondaryFields.add({ key: "title", label: "Title", value: title });
  pass.barcode("PKBarcodeFormatQR", `https://lynkmesmartcards.com${referrer}`);

  const buffer = await pass.getAsBuffer();
  return buffer;
}

module.exports = { generateApplePass };
