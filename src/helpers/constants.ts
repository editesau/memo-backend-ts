import * as dotenv from 'dotenv'

dotenv.config()

export const NODE_ENV = process.env.NODE_ENV || 'dev'

export const API_VERSION = process.env.API_VERSION || 1
export const APP_PORT = Number(process.env.APP_PORT) || 5051 
export const APP_HOST = NODE_ENV === 'dev' ? 'localhost' : process.env.APP_HOST || 'localhost'
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'localhost'
export const MORGAN_ENV = process.env.MORGAN_ENV || 'dev'

export const MONGO_HOST = process.env.MONGO_HOST || '127.0.0.1'
export const MONGO_PORT = process.env.MONGO_PORT || '27017'
export const MONGO_CA_PATH = process.env.MONGO_CA_PATH || './mongoCrt/CA.crt'
export const MONGO_CLIENT_CRT_PATH = process.env.MONGO_CLIENT_CRT_PATH || './mongoCrt/client.crt'

export const BCRYPT_SALT = Number(process.env.BCRYPT_SALT) || 10
export const JWT_SECRET = process.env.JWT_SECRET || 'verySecretJWTKeyForSign'
export const JWT_ACCESS_LIFE =  Number(process.env.JWT_ACCESS_LIFE) || 300
export const JWT_REFRESH_LIFE = Number(process.env.JWT_REFRESH_LIFE) || 86400

export const SOCKET_PATH = process.env.SOCKET_PATH || 'socket.io'

export const IMAGES_PATH = `${process.cwd()}/resources/cards/`