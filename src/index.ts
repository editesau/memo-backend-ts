import cors from "cors"
import express from "express"
import helmet from "helmet"
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import morgan from "morgan"
import { APP_HOST, APP_PORT, CORS_ORIGIN, MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH, MONGO_HOST, MONGO_PORT, MORGAN_ENV } from "./helpers/constants"
import mongoose, { MongooseError } from "mongoose"
import { genConnectionOptions, genConnectionString } from "./helpers/tools"

const app = express()

const httpServer = createServer(app)

// connect middlewares
app.use(helmet())
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}))
app.use(morgan(MORGAN_ENV))
app.use(express.json())
app.use(cookieParser())


const startServices = async (): Promise<void> => {
  const mongoConnectionString = genConnectionString(MONGO_HOST, MONGO_PORT)
  const mongoConectionOptions = genConnectionOptions(MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH)
  mongoose.set('strictQuery', false)

  try {
    await mongoose.connect(mongoConnectionString, mongoConectionOptions)
    console.log(`Connected to mongoDB at ${MONGO_HOST}:${MONGO_PORT}`)
    try {
      httpServer.listen(APP_PORT, APP_HOST, () => {
        console.log(`Server started on ${APP_HOST}:${APP_PORT}`)
      })
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
        return
      }
    }
  } catch (error) {
    if (error instanceof MongooseError) {
      console.error(error.message)
      return
    } else {
      console.error('Unknown error', error)
    }
  }
}

startServices()