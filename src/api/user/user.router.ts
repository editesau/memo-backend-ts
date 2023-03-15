import { Router } from "express"
import * as userController from './user.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
import * as authMiddleware from '@middlewares/authMiddleware'
const router = Router()

router.post('/signup', validationMiddleware.userCreate, userController.create)
router.post('/signin', validationMiddleware.userLogin, userController.login)
router.get('/logout', authMiddleware.checkAccessToken, userController.logout)
router.get('/refresh', authMiddleware.checkRefreshToken, userController.refresh)
router.get('/', authMiddleware.checkAccessToken, userController.getSelf)
router.get('/:id', authMiddleware.checkAccessToken, userController.get)

export default router