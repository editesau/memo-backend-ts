import { Router } from 'express'
import * as userController from './user.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
import * as authMiddleware from '@middlewares/authMiddleware'
export const userRouter = Router()

userRouter.post('/signup', validationMiddleware.userCreate, userController.create)
userRouter.post('/signin', validationMiddleware.userLogin, userController.login)
userRouter.get('/logout', authMiddleware.checkAccessToken, userController.logout)
userRouter.get('/refresh', authMiddleware.checkRefreshToken, userController.refresh)
userRouter.get('/', authMiddleware.checkAccessToken, userController.getSelf)
userRouter.get('/:id', authMiddleware.checkAccessToken, userController.get)
