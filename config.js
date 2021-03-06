module.exports = {
    appSecret: process.env.APP_SECRET,
    shopify: {
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
        nonce: process.env.SHOPIFY_NONCE
    },
    slack: {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
    },
    dbPath: process.env.DB_PATH,
}