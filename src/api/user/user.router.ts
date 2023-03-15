import { Router } from "express"
import * as userController from './user.controller'
import * as validationMiddleware from '../middlewares/vaidationMiddleware'
import * as authMiddleware from '../middlewares/authMiddleware'
const router = Router()

router.post('/signup', validationMiddleware.userCreate, userController.create)
router.post('/signin', validationMiddleware.userLogin, userController.login)
router.get('/logout', authMiddleware.checkAccessToken, userController.logout)
router.get('/refresh', authMiddleware.checkAccessToken, userController.refresh)

export default router