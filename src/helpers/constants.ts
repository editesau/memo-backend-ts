import * as dotenv from 'dotenv'

dotenv.config()

const NODE_ENV = 'dev'
export const API_VERSION = process.env.API_VERSION || 1
export const APP_PORT = Number(process.env.APP_PORT) || 5051 
export const APP_HOST = NODE_ENV === 'dev' ? 'localhost' : process.env.APP_HOST || 'localhost'

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'localhost'

export const MORGAN_ENV = process.env.MORGAN_ENV || 'dev'