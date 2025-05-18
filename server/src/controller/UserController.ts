import { Request, Response } from "express"
import validator from "@/validator/validator"
import model from "@/model/model"
import { User } from "@/interfaces/interface"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import keyController from "@/security/KeysController"
import emailService from "@/services/emailService"

const generateVerificationToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "1h" })
}

const signup = async (req: Request, res: Response) => {
    try {
        const { error, value } = validator.registerSchema.validate(req.body)
        if (error) {
            const errorMessages = error.details.map((err) => err.message)
            res.status(200).json({ message: errorMessages[0], isError: true })
            return
        }

        const { email, password, username } = value as User
        const existingUser = await model.User.findOne({ email }).select('username')
        if (existingUser) {
            res.status(200).json({ message: "User already exist", isError: true })
            return
        }

        const { publicKey, privateKey } = await keyController.generateKeyPair() as { publicKey: string, privateKey: string }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const newUser = new model.User({
            email,
            password: hash,
            username,
            publicKey,
            privateKey,
        })
        const verificationToken = generateVerificationToken(newUser._id.toString())
        const emailObject = {
            title: "Email Verification",
            email: email,
            username: username,
            verificationToken
        }
        emailService.sendEmail(emailObject)
        await newUser.save()
        res.status(200).json({ message: 'Verification email sent to your email', isError: false })
    } catch (err) {
        res.status(500).json({ message: 'Try again later' })
        console.error(err)
    }
}

// User Login
const login = async (req: Request, res: Response) => {
    try {
        const { error, value } = validator.loginSchema.validate(req.body)
        if (error) {
            res.status(200).json({ message: error.details[0].message, isError: true })
            return
        }
        const { email, password } = value as User
        const user = await model.User.findOne({ email: email }).select('email names password isVerified')
        if (!user) {
            res.status(200).json({ message: 'Invalid email or password', isError: true })
            return
        }

        const validated = bcrypt.compareSync(password, user.password)
        if (!validated) {
            res.status(200).json({ message: 'Incorrect Password', isError: true })
            return
        }

        if (!user.isVerified) {
            res.status(200).json({ message: 'Account not activated! Check your email to activate it.', isError: true })
            return
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
        if (!accessToken) {
            res.status(200).json({ message: 'Internal server error', isError: true })
            return
        }
        res.status(200).json({ token: accessToken, isError: false })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' })
        console.error(err)
    }
}

const getUsers = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user as { userId: string }
        const page = req.headers['page'] as unknown as number || 0
        const numberOfUsersToSkip = 10 * page
        const users = await model.User.find({ _id: { $ne: userId } })
            .select('email username names image  lastActiveTime  unreads')
            .skip(numberOfUsersToSkip)

        const usersWithMessages = await Promise.all(
            users.map(async (user) => {
                const latestMessage = await model.Message.findOne({
                    $or: [
                        { sender: userId, receiver: user._id },
                        { sender: user._id, receiver: userId }
                    ]
                })
                    .sort({ createdAt: -1 })
                    .exec()

                return {
                    ...user.toObject(),
                    latestMessage: latestMessage || null,
                }
            })
        )

        res.status(200).json({ users: usersWithMessages, isError: false })
    } catch (err) {
        res.status(500).json({ message: 'Server error ' })
    }
}


const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user
        const user = await model.User.findById(userId).populate('unreads')
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true })
            return
        }

        const latestMessage = await model.Message.findOne({
            $or: [
                { sender: userId, receiver: user._id },
                { sender: user._id, receiver: userId }
            ]
        }).sort({ createdAt: -1 }).exec()

        const userObject = {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            image: user.image,
            unreads: user.unreads,
            lastActiveTime: user.lastActiveTime,
            latestMessage: latestMessage
        } as unknown as User

        res.status(200).json({ user: userObject, isError: false })
    } catch (err) { res.status(500).json({ message: 'Server error ' + err }) }
}

const getUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params
        const user = await model.User.findById(userId).select('_id username names email image lastActiveTime groups ')
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true })
            return
        }
        const userObject = {
            _id: user._id,
            username: user.username,
            email: user.email,
            image: user.image,
            groups: user.groups,
            lastActiveTime: user.lastActiveTime
        }
        res.status(200).json({ user: userObject, isError: false })
    } catch (err) { res.status(500).json({ message: 'Server error' + err }) }
}



const updateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user
        const { error, value } = validator.updateUserSchema.validate(req.body)
        if (error) {
            res.status(200).json({ error: error.details[0], isError: true })
            return
        } 
        await model.User.findByIdAndUpdate(userId, { username: value.username, names: value.names, email: value.email })
        res.status(200).json({ message: 'user updated', isError: false })
    } catch (err) { res.status(500).json({ message: 'server error ', err }) }
}

const editUserPassword = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId
        const { oldPassword, newPassword } = req.body
        const user = await model.User.findById(userId).select('password')
        if (!user) {
            res.status(200).json({ message: 'user not found', isError: true })
            return
        }
        const validated = bcrypt.compareSync(oldPassword, user.password)
        if (!validated) {
            res.status(200).json({ message: 'Invalid password', isError: true })
            return
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassword, salt)
        await model.User.findByIdAndUpdate(userId, { password: hash })
        res.status(200).json({ message: 'user updated', isError: false })
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'server error ' })
        }
    }
}

const editUserProfilePicture = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId
        const { finalFileName } = req.body as { finalFileName: string }
        await model.User.findByIdAndUpdate(userId, { image: finalFileName })
        res.status(200).json({ message: 'profile picture updated successfull', isError: false })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}

export default {
    signup,
    login,
    getUsers,
    getUserProfile,
    getUser,
    updateUser,
    editUserPassword,
    editUserProfilePicture
}