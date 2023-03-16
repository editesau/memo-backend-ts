import { RequestHandler } from 'express'
import { Empty } from '@helpers/types'
import { User, UserAvatarRequestBody, UserLoginRequestBody, UserLoginResponseBody, UserPasswordRequestBody, UserViewModel } from '@user/user.model'
import { GameIdBody, GameStartRequestBody } from '@game/game.model'

export const userCreate: RequestHandler<Empty, UserViewModel, User> = async (req, _res, next) => {
  try {
    const isValid = await User.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    return next(error)
  }  
}

export const userLogin: RequestHandler<Empty, UserLoginResponseBody, UserLoginRequestBody> = async (req, _res, next) => {
  try {
    const isValid = await UserLoginRequestBody.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    return next(error)
  }
}

export const gameStart: RequestHandler<Empty, GameIdBody, GameStartRequestBody> = async (req, _res, next) => {
  try {
    const isValid = await GameStartRequestBody.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    return next(error)
  }
}

export const changeAvatar: RequestHandler<Empty, Empty, UserAvatarRequestBody> = async (req, _res, next) => {
  try {
    const isValid = await UserAvatarRequestBody.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    return next(error)
  }
}

export const changePassword: RequestHandler<Empty, Empty, UserPasswordRequestBody> = async (req, _res, next) => {
  try {
    const isValid = await UserPasswordRequestBody.parseAsync(req.body)
    if (isValid) next()
  } catch (error) {
    return next(error)
  }
}
