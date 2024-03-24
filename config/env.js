requir('dotenv').config();

module.exports = {
    MONGO_URL: process.env.MONGO_URL,
    PORT: process.env.PORT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET
}