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

// Create an axios instance
const shopifyAxios = axios.create({
  baseURL: `https://${shopifyConfig.shop}/admin/api/2021-10/`,
  auth: {
    username: shopifyConfig.apiKey,
    password: shopifyConfig.password,
  },
});

// Add a response interceptor to handle errors globally
shopifyAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    return Promise.reject(error);
  }
);

dbcon.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

async function fetchAndStoreProducts() {
  try {
    const response = await shopifyAxios.get('products.json');

    console.log('Response Status:', response.status);

    if (response.status === 200) {
      const productData = response.data.products;

      console.log('Fetched products from Shopify:');

      if (Array.isArray(productData) && productData.length > 0) {
        productData.forEach(product => {
          const productInfo = {
            shopify_id: product.id,
            title: product.title,
            vendor: product.vendor,
            price: product.variants[0].price,
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

        console.log('All products fetched.');
      } else {
        console.error('No product data or product data is not an array:', productData);
      }
    } else {
      console.error('Unexpected status code:', response.status);
      console.error('Response data:', response.data);
    }
  } catch (error) {
    console.error('Error fetching or storing products:', error.message);
  } finally {
    // Close the MySQL connection
    dbcon.end((endError) => {
      if (endError) {
        console.error('Error closing MySQL connection:', endError.message);
      } else {
        console.log('MySQL connection closed.');
      }
    });
  }
}

// Call the function to fetch and store products
fetchAndStoreProducts();
