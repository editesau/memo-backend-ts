import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import { Empty } from '@helpers/types'
import { checkToken } from '@services/jwt.service'
import { UserIdLocals, UserRefreshToken } from '@user/user.model'
import { Socket } from 'socket.io'
import { SocketNextFunction } from '@src/services/socket/socket.model'

export const checkAccessToken: RequestHandler<
  Empty,
  Empty,
  Empty,
  Empty,
  UserIdLocals
> = async (req, res, next) => {
  if (!req.headers.authorization) {
    const error = createHttpError(401, 'Unathorized')
    return next(error)
  }
  const accessToken = req.headers.authorization.split(' ')[1]
  if (accessToken) {
    try {
      const { userId } = checkToken(accessToken)
      res.locals.userId = userId
    } catch (error) {
      return next(error)
    }
  } else {
    const error = createHttpError(401, 'Unathorized')
    return next(error)
  }
  return next()
}

export const checkRefreshToken: RequestHandler<
  Empty,
  Empty,
  Empty,
  Empty,
  UserRefreshToken
> = async (req, res, next) => {
  const { refresh_token: refreshToken } = req.cookies
  if (refreshToken) {
    try {
      const { userId } = checkToken(refreshToken)
      res.locals.userId = userId
      res.locals.refreshToken = refreshToken
    } catch (error) {
      return next(error)
    }
  } else {
    const error = createHttpError(401, 'Your session was expired, login again')
    next(error)
  }
  return next()
}

export const socketAuthMiddleware = (socket: Socket, next: SocketNextFunction) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    const { token } = socket.handshake.auth
    try {
      const { userId } = checkToken(token)
      // eslint-disable-next-line no-param-reassign
      socket.data.userId = userId
      return next()
    } catch (e) {
      return next(new Error('Unauthorized'))
    }
  } else {
    return next(new Error('Unauthorized'))
  }
}
