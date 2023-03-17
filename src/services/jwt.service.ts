import jwt from 'jsonwebtoken'
import { JWT_ACCESS_LIFE, JWT_REFRESH_LIFE, JWT_SECRET } from '../helpers/constants'
import { UserJwtPayload } from '@user/user.model'

export const createAccessToken = (payload: UserJwtPayload) => jwt.sign(
  payload,
  JWT_SECRET,
  {
    expiresIn: +JWT_ACCESS_LIFE
  },
)

export const createRefreshToken = (payload: UserJwtPayload) => jwt.sign(
  payload,
  JWT_SECRET,
  {
    expiresIn: +JWT_REFRESH_LIFE
  },
)

function verifyPayload(data: unknown): asserts data is UserJwtPayload {
  if (!(data instanceof Object)) 
    throw new Error('Payload must be an object')
  if (!('userId' in data)) 
    throw new Error('Missing required field "userId"')
}

export const checkToken = (jwtToken: string) => {
    const payload = jwt.verify(jwtToken, JWT_SECRET)
    verifyPayload(payload)
    return payload  
}


