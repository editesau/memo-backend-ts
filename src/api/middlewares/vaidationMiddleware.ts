import { RequestHandler } from "express"
import { User, UserViewModel } from "../user/user.model"

export const userCreate: RequestHandler<{}, UserViewModel, User> = async (req, _res, next) => {
  try {
    const isValid = await User.parseAsync(req.body)
  if (isValid) next()
  } catch (error) {
    next(error)
  }  
}