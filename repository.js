const { google } = require("googleapis");
/*
const oAuth2Client = new google.auth.OAuth2(
  "921304314311-m8p4ticbh51ij1tpun2k8d0s8f6vor7n.apps.googleusercontent.com",
  "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",
  "http://localhost"
);

oAuth2Client.setCredentials({
  type: "authorized_user",
  client_id:
    "921304314311-m8p4ticbh51ij1tpun2k8d0s8f6vor7n.apps.googleusercontent.com",
  client_secret: "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",
  refresh_token:
    "1//05BFsUTupIqJ-CgYIARAAGAUSNwF-L9IrDUgQEBvdVfQYTInurFE1DU-uLbYA60JzNkdOH52WCOm7RcgiX2xKTtektn-HWCUqWr4",
});
*/
const auth = new google.auth.GoogleAuth({
  keyFile: './your-secret-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: "v4", auth: auth});

async function read() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "156h2IWkWaRj1ojsyWCkNrBbmKm0Z-uVsi3UIakneW1I",
    range: "Products!A2:E",
  });

  const rows = response.data.values;
  const products = rows.map((row) => ({
    id: +row[0],
    name: row[1],
    price: +row[2],
    image: row[3],
    stock: +row[4],
  }));

  return products;
}

async function write(products) {
    let values = products.map((p) => [p.id, p.name, p.price, p.image, p.stock]);
  
    const resource = {
      values,
    };
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: "156h2IWkWaRj1ojsyWCkNrBbmKm0Z-uVsi3UIakneW1I",
      range: "Products!A2:E",
      valueInputOption: "RAW",
      resource,
    });
  
    console.log(result.updatedCells);
  }

  async function writeOrders(orders) {
    let values = orders.map((order) => [
      order.date,
      order.preferenceId,
      order.shipping.name,
      order.shipping.email,
      JSON.stringify(order.items),
      JSON.stringify(order.shipping),
    ]);
  
    const resource = {
      values,
    };
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: "156h2IWkWaRj1ojsyWCkNrBbmKm0Z-uVsi3UIakneW1I",
      range: "Orders!A2:F",
      valueInputOption: "RAW",
      resource,
    });
  }

  async function readOrders() {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "156h2IWkWaRj1ojsyWCkNrBbmKm0Z-uVsi3UIakneW1I",
      range: "Orders!A2:F",
    });
  
    const rows = response.data.values;
    const orders = rows.map((row) => ({
      date: row[0],
      preferenceId: row[1],
      name: row[2],
      email: row[3],
      items: JSON.parse(row[4]),
      shipping: JSON.parse(row[5]),
    }));
  
    return orders;
  }

  async function updateOrderByPreferenceId(preferenceId, status) {
    const orders = await readOrders();
    const order = orders.find(o => o.preferenceId === preferenceId)
    order.status = status;
    await writeOrders(orders);
  }

  
  module.exports = {
    read,
    write,
    writeOrders,
    updateOrderByPreferenceId,
    readOrders,
  };