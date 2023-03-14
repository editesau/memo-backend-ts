import { RequestHandler } from "express"
import createHttpError from "http-errors"
import userModel, { User, UserLoginBody, UserViewModel } from "./user.model"

export const create: RequestHandler<{}, UserViewModel, User> = async (req, res, next) => {
  const {email, password, userName, avatar} = req.body
  try {
    const result = await userModel.create({email, password, userName, avatar})
    if (result) {
      const {_id, userName, email} = result.toJSON()
      res.status(201).json({_id, userName, email})
    }
  } catch(error) {
    next(error)
  }
}

export const login: RequestHandler<{}, {}, UserLoginBody> = async (req, res, next) =>  {
  const { email, password} = req.body
  const userToLogin = await userModel.findOne({email})
  if (userToLogin) {
    const error = createHttpError(400, 'Password incorrect')
    if (userToLogin.comparePasswords(password)) return res.status(200).send()
    return next(error)
  } else {
    const error = createHttpError(404, `User with email ${email} not found`)
    return next(error)
  }
}