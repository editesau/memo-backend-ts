import { RequestHandler } from 'express'
import createHttpError from 'http-errors'
import mongoose from 'mongoose'
import { Empty } from '@helpers/types'
import {
  userModel,
  UserIdLocals,
  UserViewModel,
  UserIdInParams,
  UserAvatarRequestBody,
  UserPasswordRequestBody,
  UserEmailRequestBody,
} from './user.model'

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

export const changeEmail: RequestHandler<Empty, Empty, UserEmailRequestBody, Empty, UserIdLocals> = async (req, res, next) => {
  const userId = res.locals.userId
  const { newEmail } = req.body
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      const error = createHttpError(404, 'User not found')
      return next(error)
    } else {
      user.email = newEmail
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
