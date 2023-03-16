import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { Empty } from '@helpers/types'
import { createAccessToken, createRefreshToken } from '@services/jwt.service'
import {
  userModel,
  User,
  UserLoginRequestBody,
  UserLoginResponseBody,
  UserIdLocals,
  UserViewModel,
  UserIdInParams,
  UserAvatarRequestBody,
  UserPasswordRequestBody,
} from './user.model'

export const create: RequestHandler<{}, UserViewModel, User> = async (req,res,next) => {
  const { email, password, userName, avatar } = req.body
  try {
    const result = await userModel.create({
      email,
      password,
      userName,
      avatar,
    })
    if (result) {
      const { _id, userName, email, avatar } = result.toJSON()
      return res.status(201).json({ _id, userName, email, avatar })
    }
  } catch (error) {
    next(error)
  }
}

export const login: RequestHandler<Empty, UserLoginResponseBody, UserLoginRequestBody> = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const userToLogin = await userModel.findOne({ email })
    if (userToLogin) {
      if (userToLogin.comparePasswords(password)) {
        const userId = userToLogin._id.toString()
        const accessToken = createAccessToken({ userId })
        const refreshToken = createRefreshToken({ userId })
        try {
          userToLogin.refreshToken = refreshToken
          await userToLogin.save()
        } catch (error) {
          return next(error)
        }
        return res
          .status(200)
          .cookie('refresh_token', refreshToken, { httpOnly: true })
          .json({ accessToken })
      }
      const error = createHttpError(400, 'Password incorrect')
      return next(error)
    } else {
      const error = createHttpError(404, `User with email ${email} not found`)
      return next(error)
    }
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler<Empty, Empty, Empty, Empty, UserIdLocals> = async (_req, res, next) => {
  const userId = res.locals.userId
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      const error = createHttpError(404, 'User not found')
      return next(error)
    }
    user.refreshToken = ''
    try {
      await user.save()
    } catch (_e) {
      const error = createHttpError(500, 'Error when try to save user data')
      return next(error)
    }
    return res
      .cookie('refresh_token', '', { httpOnly: true })
      .status(200)
      .send()
  } catch (_e) {
    const error = createHttpError(500, 'Error when try to get user info')
    return next(error)
  }
}

export const refresh: RequestHandler<Empty, UserLoginResponseBody, Empty, Empty, UserIdLocals> = async (_req, res, next) => {
  const userId = res.locals.userId
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      const error = createHttpError(404, 'User not found')
      return next(error)
    }
    const accessToken = createAccessToken({ userId })
    const refreshToken = createRefreshToken({ userId })
    user.refreshToken = refreshToken
    try {
      await user.save()
    } catch (_e) {
      const error = createHttpError(500, 'Error when try to save user data')
      return next(error)
    }
    return res
      .status(200)
      .cookie('refresh_token', refreshToken, { httpOnly: true })
      .json({ accessToken })
  } catch (_e) {
    const error = createHttpError(500, 'Error when try to get user info')
    return next(error)
  }
}

export const getSelf: RequestHandler<Empty, UserViewModel, Empty, Empty, UserIdLocals> = async (_req, res, next) => {
  const userId = res.locals.userId
  if (!mongoose.isValidObjectId(userId)) {
    const error = createHttpError(400, 'Invalid user ID')
    return next(error)
  } else {
    try {
      const userDoc = await userModel.findById(userId)
      if (!userDoc) {
        const error = createHttpError(404, 'User not found')
        return next(error)
      } else {
        const { _id, userName, email, avatar } = userDoc.toJSON()
        return res.json({ _id, userName, email, avatar })
      }
    } catch (_e) {
      const error = createHttpError(500, 'Error when try to find user')
      return next(error)
    }
  }
}

export const get: RequestHandler<UserIdInParams, UserViewModel, Empty, Empty, Empty> = async (req, res, next) => {
  const userId = req.params.id
  if (!mongoose.isValidObjectId(userId)) {
    const error = createHttpError(400, 'Invalid user ID')
    return next(error)
  } else {
    try {
      const userDoc = await userModel.findById(userId)
      if (!userDoc) {
        const error = createHttpError(404, 'User not found')
        return next(error)
      } else {
        const { _id, userName, email, avatar } = userDoc.toJSON()
        return res.json({ _id, userName, email, avatar })
      }
    } catch (_e) {
      const error = createHttpError(500, 'Error when try to find user')
      return next(error)
    }
  }
}

export const setAvatar: RequestHandler<Empty, Empty, UserAvatarRequestBody, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  const { avatarUrl } = req.body
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      const error = createHttpError(404, 'User not found')
      return next(error)
    } else {
      user.avatar = avatarUrl
      try {
        await user.save()
        return res.sendStatus(200)
      } catch (error) {
        return next(error)
      }
    }
  } catch (error) {
    return next(error)
  }
}

export const changePassword: RequestHandler<Empty, Empty, UserPasswordRequestBody, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      const error = createHttpError(404, 'User not found')
      return next(error)
    } else {
      if (user.comparePasswords(req.body.currentPassword)) {
        user.password = req.body.newPassword
        try {
          await user.save()
          return res.sendStatus(200)
        } catch (error) {
          return next(error)
        }
      } else {
        const error = createHttpError(400, 'Password incorrect')
        return next(error)
      }
    }      
  } catch (error) {
    return next(error)
  }
}
