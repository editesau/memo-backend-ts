import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import * as authMiddleware from '@middlewares/authMiddleware'
import { API_VERSION, CORS_ORIGIN, MORGAN_ENV, NODE_ENV } from '@helpers/constants'
import { userRouter } from '@user/user.router'
import { gameRouter } from '@game/game.router'
import { errorHandler } from '@middlewares/errorMiddleware'

export const app = express()

app.use(helmet())
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}))
if (NODE_ENV !== 'test') app.use(morgan(MORGAN_ENV))
app.use(express.json())
app.use(cookieParser())
app.use('/resources/cards/images',authMiddleware.checkAccessToken, express.static('resources/cards'))
app.use(`/api/v${API_VERSION}/user`, userRouter)
app.use(`/api/v${API_VERSION}/game`, gameRouter)
app.use(errorHandler)