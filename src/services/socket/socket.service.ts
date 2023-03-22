import { socketAuthMiddleware } from '@src/api/middlewares/authMiddleware'
import { CORS_ORIGIN, SOCKET_PATH } from '@src/helpers/constants'
import { Empty } from '@src/helpers/types'
import { Server as httpServer } from 'http'
import { Server as socketServer, Socket } from 'socket.io'
import { getGameSocketHandler, mainGameLoopHandler } from '../gameEngine.service'
import { IncomingSocketEvents, OutSocketEvents, SocketDataType } from './socket.model'

const registerListeners = (io: socketServer) => {
  io.on('connection', (socket: Socket<IncomingSocketEvents, OutSocketEvents, Empty, SocketDataType>) => {
    console.log(`User ${socket.data.userId} from ${socket.handshake.address} connected`)
    socket.on('GET_GAME', getGameSocketHandler.bind(socket))
    socket.on('OPEN_CARD', mainGameLoopHandler.bind(socket))
    socket.on('error', (err) => {
      socket.emit('ERROR', { message: err.message })
    })
  })
}

export const initializeSocketServer = (http: httpServer) => {
  const io = new socketServer(http, {
    path: SOCKET_PATH,
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
  })
  io.use(socketAuthMiddleware)
  registerListeners(io)
}