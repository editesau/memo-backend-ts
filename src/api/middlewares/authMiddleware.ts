import { RequestHandler } from "express"
import createHttpError from "http-errors"
import { Empty } from "../../helpers/types"
import { checkToken } from "../../services/jwt.service"
import { UserIdLocals } from "../user/user.model"

export const checkAccessToken: RequestHandler<Empty, Empty, Empty, Empty, UserIdLocals> = async (req, res, next) => {
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
      next(error)
    }
  } else {
    const error = createHttpError(401, 'Unathorized')
    return next(error)
  }
  return next()
}