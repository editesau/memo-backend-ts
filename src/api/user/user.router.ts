import { Router } from "express"
import * as userController from './user.controller'
import * as validationMiddleware from '../middlewares/vaidationMiddleware'
const router = Router()

router.post('/signup', validationMiddleware.userCreate, userController.create)
router.post('/signin', userController.login)

export default router