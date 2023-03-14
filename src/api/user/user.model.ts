import { z } from 'zod'
import mongoose, { Document, Schema } from 'mongoose'

const User = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userName: z.string().min(4),
  avatar: z.string().url().optional()
})

export type User = z.infer<typeof User>
export type UserViewModel = Omit<User, 'password'>

interface UserDoc extends User, Document {}

const userSchema = new Schema({
  email: {type: String, require: true},
  password: {type: String, require: true},
  userName: {type: String, require: true},
  avatar: {type: String, default: ''},
})

const userModel = mongoose.model<UserDoc>('users', userSchema)

export default userModel