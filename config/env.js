require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CLOUD_NAME = process.env.CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
    MONGO_URL,
    PORT,
    OPENAI_API_KEY,
    CLOUD_NAME,
    CLOUDINARY_KEY,
    CLOUDINARY_SECRET,
    NODE_ENV,
    JWT_SECRET
}