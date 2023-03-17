import { Router } from 'express'
import * as authMiddleware from '@middlewares/authMiddleware'
import * as gameController from '@game/game.controller'
import * as validationMiddleware from '@middlewares/vaidationMiddleware'
export const gameRouter = Router()

gameRouter.use(authMiddleware.checkAccessToken)
gameRouter.post('/start', validationMiddleware.gameStart, gameController.start)
gameRouter.post('/:gameId/reset', gameController.reset)
gameRouter.get('/types', gameController.getTypes)
