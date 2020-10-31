module.exports = {
    shopify: {
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
        nonce: process.env.SHOPIFY_NONCE
    },
    mongo: {
        url: process.env.MONGO_URL,
    }
}