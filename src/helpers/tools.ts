import { IMAGES_PATH, MONGO_CA_PATH, MONGO_CLIENT_CRT_PATH } from './constants'
import * as fs from 'fs'

/** Function to generate mongoDB connection URL
 *@param host {string} IP address or DNS hostname
 *@param port {string} mongoDB port
 *@return {string} mongodb URL: mongodb://host:port
 */
export const genConnectionString = (host: string, port: string): string => {
  if (!MONGO_CA_PATH) throw Error('No mongo CA Path in environment')
  if (!MONGO_CLIENT_CRT_PATH) throw Error('No mongo client crt Path in environment')

  return `mongodb://${host}:${port}/memo-game`
}

/** Function to generate mongoDB connection options with x509 Auth
 *@param caCertPath {string} Full path to CA certificate
 *@param clientCertPath {string} Full path to client certificate
 *@return {Object} Object contains all needed options to secure connect with x509
 */
export const genConnectionOptions = (caCertPath: string, clientCertPath: string): object => ({
  tls: true,
  tlsInsecure: true,
  tlsCAFile: caCertPath,
  tlsCertificateKeyFile: clientCertPath,
  authMechanism: 'MONGODB-X509',
})

export const getImagesFiles = (gameType: string): string[] => fs.readdirSync(IMAGES_PATH + gameType)