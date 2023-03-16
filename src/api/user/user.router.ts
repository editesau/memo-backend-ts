import { Router } from 'express'
import * as userController from './user.controller'
import * as authController from './userAuth.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
import * as authMiddleware from '@middlewares/authMiddleware'
export const userRouter = Router()

userRouter.post('/signup', validationMiddleware.userCreate, authController.create)
userRouter.post('/signin', validationMiddleware.userLogin, authController.login)
userRouter.get('/logout', authMiddleware.checkAccessToken, authController.logout)
userRouter.get('/refresh', authMiddleware.checkRefreshToken, authController.refresh)

userRouter.get('/', authMiddleware.checkAccessToken, userController.getSelf)
userRouter.get('/:id', authMiddleware.checkAccessToken, userController.get)

userRouter.patch('/avatar', authMiddleware.checkAccessToken, validationMiddleware.changeAvatar, userController.setAvatar)
userRouter.patch('/password', authMiddleware.checkAccessToken, validationMiddleware.changePassword, userController.changePassword)
userRouter.patch('/email', authMiddleware.checkAccessToken, validationMiddleware.changeEmail, userController.changeEmail)
