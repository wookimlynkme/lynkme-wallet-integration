const path = require("path");
const PKPass = require("passkit-generator");

async function generateApplePass({ name, title, referrer }) {
  const template = new PKPass({
    model: path.join(__dirname, "template.pass"),
    certificates: {
      wwdr: path.join(__dirname, "../certs/wwdr.pem"),
      signerCert: path.join(__dirname, "../certs/certificate.pem"),
      signerKey: {
        keyFile: path.join(__dirname, "../certs/key.pem"),
        passphrase: process.env.APPLE_CERT_PASS
      }
    }
  });

  template.fields.primaryFields.add({ key: "name", label: "Name", value: name });
  template.fields.secondaryFields.add({ key: "title", label: "Title", value: title });

  template.barcode("PKBarcodeFormatQR", `https://lynkmesmartcards.com${referrer}`);

  const buffer = await template.getAsBuffer();
  return buffer;
}

module.exports = { generateApplePass };
