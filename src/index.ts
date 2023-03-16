import { createServer } from 'http'
import { app } from './app'
import { APP_HOST, APP_PORT, MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH, MONGO_HOST, MONGO_PORT } from './helpers/constants'
import mongoose from 'mongoose'
import { genConnectionOptions, genConnectionString } from '@helpers/tools'

const httpServer = createServer(app)

const startServices = async (): Promise<void> => {
  
  const mongoConnectionString = genConnectionString(MONGO_HOST, MONGO_PORT)
  const mongoConectionOptions = genConnectionOptions(MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH)

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
    if (error instanceof Error) {
      console.error(error.message)
      return
    } else {
      console.error('Unknown error', error)
    }
  }
}

startServices()