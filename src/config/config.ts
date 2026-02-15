import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

export const configEnv = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: PORT,
}
