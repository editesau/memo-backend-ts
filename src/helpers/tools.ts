import { IMAGES_PATH, MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH } from './constants'
import * as fs from 'fs'

export const genConnectionString = (host: string, port: string): string => {
  if (!MONGO_CA_PATH) throw Error('No mongo CA Path in environment')
  if (!MONGO_CLIENT_CRT_PATH) throw Error('No mongo client crt Path in environment')

  return `mongodb://${host}:${port}/memo-game`
}

export const genConnectionOptions = (caCertPath: string, clientCertPath: string): object => ({
  tls: true,
  tlsInsecure: true,
  tlsCAFile: caCertPath,
  tlsCertificateKeyFile: clientCertPath,
  authMechanism: 'MONGODB-X509',
})

export const getImagesFiles = (gameType: string): string[] => fs.readdirSync(IMAGES_PATH + gameType)
export const getTypesDir = (): string[] => fs.readdirSync(IMAGES_PATH)