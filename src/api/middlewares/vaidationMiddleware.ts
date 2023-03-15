import { RequestHandler } from "express"
import { Empty } from "../../helpers/types"
import { User, UserLoginRequestBody, UserLoginResponseBody, UserViewModel } from "../user/user.model"

export const userCreate: RequestHandler<Empty, UserViewModel, User> = async (req, _res, next) => {
  try {
    const isValid = await User.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    next(error)
  }  
}

export const userLogin: RequestHandler<Empty, UserLoginResponseBody, UserLoginRequestBody> = async (req, _res, next) => {
  try {
    const isValid = await UserLoginRequestBody.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    next(error)
  }
}