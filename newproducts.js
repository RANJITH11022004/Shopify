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
  database: 'shopify_products',
});

dbcon.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

async function fetchAndStoreNewProducts() {
  try {
    // Fetch all products from Shopify
    const response = await axios.get(
      `https://${shopifyConfig.shop}/admin/api/2021-10/products.json`,
      {
        auth: {
          username: shopifyConfig.apiKey,
          password: shopifyConfig.password,
        },
      }
    );

    // Check if the response status is 200 (OK)
    if (response.status === 200) {
      const newProducts = response.data.products;

      console.log('Fetched products from Shopify:');

      if (Array.isArray(newProducts) && newProducts.length > 0) {
        // Get the current date in the format YYYY-MM-DD
        const currentDate = new Date().toISOString().split('T')[0];

        // Filter out only the products created on the current date
        const newProductsToday = newProducts.filter(product => {
          const productCreationDate = product.created_at.split('T')[0];
          return productCreationDate === currentDate;
        });

        // Store the new products in the database
        newProductsToday.forEach(product => {
          const productInfo = {
            shopify_id: product.id,
            title: product.title,
            vendor: product.vendor,
            price: product.variants[0].price,
            created_at: product.created_at,
            // Add other relevant fields as needed
          };

          const insertQuery = 'INSERT INTO products SET ?';

          dbcon.query(insertQuery, productInfo, (error, results) => {
            if (error) {
              console.error('Error inserting product into MySQL:', error);
            } else {
              console.log('Product added to database with ID:', results.insertId);
            }
          });
        });

        console.log('New products created today stored successfully.');
      } else {
        console.error('No new product data or product data is not an array:', newProducts);
      }
    } else {
      console.error('Unexpected status code:', response.status);
      console.error('Response data:', response.data);
    }
  } catch (error) {
    // Log the error details
    console.error('Error fetching or storing products:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
  } finally {
    // Close the MySQL connection
    dbcon.end((endError) => {
      if (endError) {
        console.error('Error closing MySQL connection:', endError.stack);
      } else {
        console.log('MySQL connection closed.');
      }
    });
  }
}

// Call the function to fetch and store new products created today
fetchAndStoreNewProducts();
