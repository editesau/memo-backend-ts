import { Card } from "@game/game.model"
import { getImagesFiles } from "@helpers/tools"
import { v4 as uuid } from 'uuid'

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

