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

// export async function GameEventsSocketHandler(this: Socket<IncomingSocketEvents, OutSocketEvents, Empty, SocketDataType>, [event, ...args]: Event, next: SocketNextFunction) {
//   if (event as keyof IncomingSocketEvents === 'GET_GAME'){
//     if (typeof args[0] !== 'string') return next(Error('Incorrect data'))
//     const game = await gameModel.findOne({_id: args[0], userId: this.data.userId})
//     if (!game) {
//       return next(Error('Game not found'))
//     } else {
//       const {cards, state, type} = game.toJSON()
//       return this.emit('GAME_LOADED', {cards: filterCards(cards), state, gameType: type})
//     }
//   } else if (event as keyof IncomingSocketEvents === 'OPEN_CARD') {
//     this.emit('LOCK_BOARD')
//     if (typeof args[0] !== 'object') return next(Error('Incorrect data'))
//     const { gameId, cardId } = args[0] as OpenCardData
//     const game = await gameModel.findOne({_id: gameId, userId: this.data.userId})
//     if (!game) {
//       next(Error('Game not found'))
//       return this.emit('UNLOCK_BOARD')
//     } else {
//       if (!game.openedCards.length) {
//         const [updatedCards, openedPicture] = openCard(game.cards, cardId)
//         game.cards = updatedCards
//         game.openedCards = [{id: cardId, picture: openedPicture}]
//         try {
//           await game.save()
//           const cardToReturn = filterCards(game.cards).find((card) => card.id === cardId)
//           if (!cardToReturn) return next(Error('Error when try to open card'))
//           this.emit('CARD_OPENED', cardToReturn)
//           return this.emit('UNLOCK_BOARD')
//         } catch {
//           next(Error('Error when try to save opened cards'))
//           return this.emit('UNLOCK_BOARD')
//         }
//       } else if (game.openedCards.length === 1) {
//         const [updatedCards, openedPicture] = openCard(game.cards, cardId)
//         if (!openedPicture) {
//           next(Error('Error when try to get card picture'))
//           return this.emit('UNLOCK_BOARD')
//         }
//         game.cards = updatedCards
//         game.openedCards = [...game.openedCards, {id: cardId, picture: openedPicture}]
//         try {
//           await game.save()
//         } catch {
//           next(Error('Error when try to save opened cards'))
//           return this.emit('UNLOCK_BOARD')
//         }
//         this.emit('CARD_OPENED', {id: cardId, isOpen: true, isMatched: false, picture: openedPicture})
//         if (game.openedCards[0].picture === game.openedCards[1].picture) {
//           const [firstCard, secondCard] = game.openedCards
//           game.openedCards = []
//           const updatedCards = setMatchedCards(game.cards, [firstCard.id, secondCard.id])
//           game.cards = updatedCards
//           try {
//             await game.save()
//           } catch{
//             next(Error('Error when try to save game state'))
//             return this.emit('UNLOCK_BOARD')
//           }
//           setTimeout(() => {
//             this.emit('MATCHED', [firstCard.id, secondCard.id])          
//             return this.emit('UNLOCK_BOARD')
//           }, 2000)
//         } else {
//           const firstCardId = game.openedCards[0].id
//           game.openedCards = []
//           const updatedCards = closeCards(game.cards, [firstCardId, cardId])
//           game.cards = updatedCards
//           try {
//             await game.save()
//             return this.emit('UNLOCK_BOARD')
//           } catch{
//             next(Error('Error when try to save game state'))
//           }
//         }
//       }
//     }
//   }
// }

