const axios = require('axios');
const mysql = require('mysql2');

const shopifyConfig = {
  apiKey: '9eaee21aadf3f5a40cffd861b8ee5167',
  password: '44a44adaa3eaf5820625f3a501f874c3',
  shop: 'smartchoice1.myshopify.com',
};

const dbcon = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '.bumrah007',
  database: 'shopify_orders',
});

dbcon.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

async function fetchAndStoreOrders() {
  try {
    const response = await axios.get(
      `https://${shopifyConfig.shop}/admin/api/2021-10/orders.json`,
      {
        auth: {
          username: shopifyConfig.apiKey,
          password: shopifyConfig.password,
        },
      }
    );

    const orderData = response.data.orders;

    console.log('Fetched orders from Shopify:');

    if (Array.isArray(orderData) && orderData.length > 0) {
      orderData.forEach(order => {
        const orderInfo = {
          shopify_id: order.id,
          customer_name: order.customer ? order.customer.first_name + ' ' + order.customer.last_name : 'Guest',
          total_price: order.total_price,
          order_status: order.financial_status,
          // Add other relevant fields as needed
        };

        const insertQuery = 'INSERT INTO orders SET ?';

        dbcon.query(insertQuery, orderInfo, (error, results) => {
          if (error) {
            console.error('Error inserting order into MySQL:', error);
          } else {
            console.log('Order added to database with ID:', results.insertId);
          }
        });
      });
    } else {
      console.error('No order data or order data is not an array:', orderData);
    }

  } catch (error) {
    console.error('Error fetching or storing orders:', error);
  } finally {
    // Do not close the MySQL connection here to keep it open for potential future queries
  }
}

// Call the function to fetch and store orders
fetchAndStoreOrders();
