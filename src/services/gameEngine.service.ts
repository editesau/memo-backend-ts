import { Card, gameModel } from '@game/game.model'
import { getImagesFiles } from '@helpers/tools'
import { Empty } from '@src/helpers/types'
import { Socket } from 'socket.io'
import { v4 as uuid } from 'uuid'
import { IncomingSocketEvents, OpenCardData, OutSocketEvents, SocketDataType } from './socket/socket.model'

export const generateCards = (size: number, gameType: string): Card[] => {
  const pictures = getImagesFiles(gameType).slice(0, size / 2)
  const cardImages = [...pictures, ...pictures]
  cardImages.sort(() => Math.random() - 0.5)
  const cards = []
  for (let i = 0; i < size; i++) {
    const pic = cardImages.pop()
    if (pic) {
      cards.push({
        id: uuid(),
        picture: pic,
        isOpen: false,
        isMatched: false,
      })
    }
  }
  return cards
}

export const filterCards = (cards: Card[]) => cards.map((card) => {
  if (card.isOpen || card.isMatched) return card
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { picture: _, ...returnedCard } = card
  return returnedCard
})

const openCard = (cards: Card[], idToOpen: string): [cards: Card[], picture: string] => {
  let openedPicture = ''
  const updatedCards = cards.map((card) => {
    if (card.id === idToOpen) {
      openedPicture = card.picture!
      return {
        ...card,
        isOpen: true
      }
    }
    return card
  })
  return [updatedCards, openedPicture]
}

const setMatchedCards = (cards: Card[], cardIds: string[]): Card[] => cards.map((card) => {
  if (card.isOpen && cardIds.includes(card.id)) {
    return {
      ...card,
      isOpen: false,
      isMatched: true,
    }
  }
  return card
})

const closeCards = (cards: Card[], cardIds: string[]): Card[] => cards.map((card) => {
  if (card.isOpen && cardIds.includes(card.id)) {
    return {
      ...card,
      isOpen: false,
    }
  }
  return card
})


export async function getGameSocketHandler(this: Socket<IncomingSocketEvents, OutSocketEvents, Empty, SocketDataType>, gameId: string) {
  const game = await gameModel.findOne({_id: gameId, userId: this.data.userId})
  if (!game) return this.emit('ERROR', {message: 'Cant find game'})
  const {cards, state, type} = game.toJSON()
  return this.emit('GAME_LOADED', {cards: filterCards(cards), state, gameType: type})
}

export async function mainGameLoopHandler(this: Socket<IncomingSocketEvents, OutSocketEvents, Empty, SocketDataType>, data: OpenCardData) {
  this.emit('LOCK_BOARD')
  const game = await gameModel.findOne({_id: data.gameId, userId: this.data.userId})

  if (!game) return this.emit('ERROR', {message: 'Cant find game'})

  if(game.openedCards.length === 2) return this.emit('UNLOCK_BOARD')

  const [updatedCards, openedPicture] = openCard(game.cards, data.cardId)
  game.openedCards = [...game.openedCards, {id: data.cardId, picture: openedPicture}]
  game.cards = updatedCards
  try {
    await game.save()
    const cardToReturn = filterCards(game.cards).find((card) => card.id === data.cardId)

    if (!cardToReturn) return this.emit('ERROR', {message: 'Error when try to open card'})

    this.emit('CARD_OPENED', cardToReturn)

    if (game.openedCards.length === 1) return this.emit('UNLOCK_BOARD')

    const [firstCard, secondCard] = game.openedCards
    game.openedCards = []
    if (firstCard.picture === secondCard.picture) {
      game.cards = setMatchedCards(game.cards, [firstCard.id, secondCard.id])
      const isFinished = game.cards.every((card) => card.isMatched)
      if (isFinished) game.state = 'FINISHED'
      await game.save()     

      setTimeout(() => {
        this.emit('MATCHED', [firstCard.id, secondCard.id])
        return isFinished ? this.emit('GAME_FINISHED') && this.emit('UNLOCK_BOARD') : this.emit('UNLOCK_BOARD')
      }, 1000)

    } else {
      game.cards = closeCards(game.cards, [firstCard.id, secondCard.id])
      await game.save()

      setTimeout(() => {
        this.emit('MISMATCH', [firstCard.id, secondCard.id])
        return this.emit('UNLOCK_BOARD')
      }, 1500)
    }        
  } catch {
    this.emit('ERROR', {message:'Error when try to save updated game state'})
    return this.emit('UNLOCK_BOARD')
  }
}
