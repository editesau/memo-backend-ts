import cors from "cors"
import express from "express"
import helmet from "helmet"
import cookieParser from 'cookie-parser'
import { createServer } from 'http'
import morgan from "morgan"
import { APP_HOST, APP_PORT, CORS_ORIGIN, MORGAN_ENV } from "./helpers/constants"


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

httpServer.listen(APP_PORT, APP_HOST, () => {
  console.log(`Server started on ${APP_HOST}:${APP_PORT}`)
})