import { Router } from 'express'
import * as userController from './user.controller'
import * as authController from './userAuth.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
import * as authMiddleware from '@middlewares/authMiddleware'
export const userRouter = Router()

userRouter.post('/signup', validationMiddleware.userCreate, authController.create)
userRouter.post('/signin', validationMiddleware.userLogin, authController.login)
userRouter.get('/refresh', authMiddleware.checkRefreshToken, authController.refresh)

userRouter.use(authMiddleware.checkAccessToken)
userRouter.get('/logout', authController.logout)

userRouter.get('/', userController.getSelf)
userRouter.get('/:id', userController.get)

userRouter.patch('/avatar', validationMiddleware.changeAvatar, userController.setAvatar)
userRouter.patch('/password', validationMiddleware.changePassword, userController.changePassword)
userRouter.patch('/email', validationMiddleware.changeEmail, userController.changeEmail)
