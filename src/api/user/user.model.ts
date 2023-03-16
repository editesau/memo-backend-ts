import { z } from 'zod'
import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
import { BCRYPT_SALT } from '@helpers/constants'
import { JwtPayload } from 'jsonwebtoken'
import { Empty } from '@helpers/types'

export const User = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userName: z.string().min(4),
  avatar: z.string().url().optional(),
  refreshToken: z.string().optional(),
})

export const UserLoginRequestBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type User = z.infer<typeof User>;
export type UserLoginRequestBody = z.infer<typeof UserLoginRequestBody>;
export interface UserLoginResponseBody {
  accessToken: string
}
export interface UserIdLocals {
  userId: string
}
export interface UserIdInParams {
  id: string
}
export interface UserViewModel extends Omit<User, 'password' | 'refreshToken'> {
  _id: mongoose.Types.ObjectId
}
export interface UserJwtPayload extends JwtPayload {
  userId: string
}
export interface UserAvatarRequestBody {
  avatarUrl: string
}
export interface UserPasswordRequestBody {
  currentPassword: string
  newPassword: string
}
export interface UserMethods {
  comparePasswords(candidatePassword: string): boolean
}

type UserModel = mongoose.Model<User, Empty, UserMethods>;

const userSchema = new mongoose.Schema<User, UserModel, UserMethods>(
  {
    email: { type: String, require: true },
    password: { type: String, require: true },
    userName: { type: String, require: true },
    avatar: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
  },
  {
    versionKey: false,
  }
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT)
    next()
  }
})

userSchema.methods.comparePasswords = function (
  candidatePassword: string
): boolean {
  const isValid = bcrypt.compareSync(candidatePassword, this.password)
  return isValid
}

export const userModel = mongoose.model<User, UserModel>(
  'users_test',
  userSchema
)
