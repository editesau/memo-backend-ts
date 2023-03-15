import { ErrorRequestHandler } from "express"
import createHttpError from "http-errors"
import { TokenExpiredError } from "jsonwebtoken"
import { ZodError } from "zod"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({message: error.issues.map((err) => `${err.path}: ${err.message}`).join(', ')})
  }
  if (error instanceof TokenExpiredError) {
    return res.status(401).json({message: 'Access token expired'})
  }
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({message: error.message})
  }
  if (error instanceof Error) {
    switch (error.name) {
      case 'MongoServerError':
        if (error.message.indexOf('duplicate') !== -1) return res.status(409).json({message: 'User already exists'})
        return res.status(500).json({message: 'Unknown MongoServer error'})
      default:
        return res.status(500).json({message: 'Unknown server error'})
    }
  }  
}