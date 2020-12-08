
import jwt from 'jsonwebtoken';

declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST: string;
    DB_USER: string;
    DB_NAME: string;
    DB_PASSWORD: string;
    DB_PORT: string;
    JWT_SECRET: jwt.Secret;
    INVITATION_JWT_SECRET: jwt.Secret;
    EMAIL_SENDER_SMTP_HOST: string;
    EMAIL_SENDER_ACCOUNT: string;
    EMAIL_SENDER_PASSWORD: string;
    GOOGLE_AUTH_CLIENT_ID: string;
    GOOGLE_AUTH_CLIENT_SECRET: string;
    GOOGLE_AUTH_API_KEY: string;
    GOOGLE_REDIRECT_URL: string;
  }
}
