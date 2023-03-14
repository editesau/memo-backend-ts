import { ErrorRequestHandler } from "express"
import createHttpError from "http-errors"
import { ZodError } from "zod"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({message: error.message})
  }
  if (error instanceof ZodError) {
    return res.status(400).json({message: error.issues.map((err) => `${err.path}: ${err.message}`).join(', ')})
  }
  if (error instanceof Error) {
    switch (error.name) {
      case 'MongoServerError':
        if (error.message.indexOf('duplicate') !== -1) return res.status(409).json({message: 'User already exists'})
        return res.status(500).json({message: 'Unknown MongoServerError error'})
      default:
        return res.status(500).json({message: 'Unknown server error'})
    }
  }
}