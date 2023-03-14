import { z } from 'zod'
import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
import { BCRYPT_SALT } from '../../helpers/constants'
export const User = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userName: z.string().min(4),
  avatar: z.string().url().optional(),
  refreshToken: z.string().optional(),
})

export type User = z.infer<typeof User>
export interface UserMethods {
  comparePasswords(candidatePassword: string): boolean
}
type UserModel = mongoose.Model<User, {}, UserMethods>
export interface UserLoginBody {
  email: string
  password: string
}
export interface UserViewModel extends Omit<User, 'password' | 'refreshToken'> {
  _id: mongoose.Types.ObjectId
} 
const userSchema = new mongoose.Schema<User, UserModel, UserMethods>({
  email: {type: String, require: true},
  password: {type: String, require: true},
  userName: {type: String, require: true},
  avatar: {type: String, default: ''},
  refreshToken: {type: String, default: ''}
}, {
  versionKey: false
})

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT)
    next()
  }
})

userSchema.methods.comparePasswords = function(candidatePassword: string): boolean {
  const isValid = bcrypt.compareSync(candidatePassword, this.password) 
  return isValid
}

const userModel = mongoose.model<User, UserModel>('users', userSchema)

export default userModel