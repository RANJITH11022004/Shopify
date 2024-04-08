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
  database: 'shopify_customers',
});

dbcon.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

async function fetchAndStoreCustomers() {
  try {
    const response = await axios.get(
      `https://${shopifyConfig.shop}/admin/api/2021-10/customers.json`,
      {
        auth: {
          username: shopifyConfig.apiKey,
          password: shopifyConfig.password,
        },
      }
    );

    const customerData = response.data.customers;

    console.log('Fetched customers from Shopify:');

    if (Array.isArray(customerData) && customerData.length > 0) {
      customerData.forEach(customer => {
        const customerInfo = {
          shopify_id: customer.id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          // Add other relevant fields as needed
        };

        const insertQuery = 'INSERT INTO customers SET ?';

        dbcon.query(insertQuery, customerInfo, (error, results) => {
          if (error) {
            console.error('Error inserting customer into MySQL:', error);
          } else {
            console.log('Customer added to database with ID:', results.insertId);
          }
        });
      });
    } else {
      console.error('No customer data or customer data is not an array:', customerData);
    }

  } catch (error) {
    console.error('Error fetching or storing customers:', error);
  } finally {
    // Do not close the MySQL connection here to keep it open for potential future queries
  }
}

// Call the function to fetch and store customers
fetchAndStoreCustomers();
