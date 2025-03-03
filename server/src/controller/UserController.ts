import { Request, Response } from "express";
import validator from "../validator/validator";
import model from "../model/model";
import { User } from "../interface/interface";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import keyController from "../security/KeysController";
import decryptionController from "../security/Decryption"
import emailService from "../services/emailService";

const generateVerificationToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
};

const signup = async (req: Request, res: Response) => {
    try {
        const { error, value } = validator.registerSchema.validate(req.body);
        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            res.status(400).json({ message: 'Validation failed', errors: errorMessages });
            return;
        }

        const { email, password, username, names } = value as User;
        const existingUser = await model.User.findOne({ email }).select('username');
        if (existingUser) {
            res.status(400).json({ message: "User exist" })
            return
        };
        const { publicKey, privateKey } = await keyController.generateKeyPair() as { publicKey: string, privateKey: string };
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new model.User({
            email,
            password: hash,
            username,
            names,
            publicKey,
            privateKey
        });
        const verificationToken = generateVerificationToken(newUser._id.toString());
        const emailObject = {
            title: "Email Verification",
            email: email,
            name: names,
            verificationToken
        }
        emailService.sendEmail(emailObject)
        await newUser.save();
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
    }
};

// User Login
const login = async (req: Request, res: Response) => {
    try {
        const { error, value } = validator.loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message })
            return
        }
        const { email, password } = value as User
        const user = await model.User.findOne({ email: email }).select('email password isVerified');
        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' })
            return
        };


        const validated = bcrypt.compareSync(password, user.password);
        if (!validated) {
            res.status(400).json({ message: 'Incorrect Password' })
            return
        };

        if (!user.isVerified) {
            res.status(400).json({ message: 'Email not verified check your inbox for verification link' })
            return
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
        if (!accessToken) {
            res.status(500).json({ message: 'Internal server error' })
            return
        };
        res.status(200).json({ accessToken });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' })
        console.error(err)
    }
}

const getUsers = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user as { userId: string };
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
                    .exec();
                if (latestMessage) {
                    const decryptedMessage = await decryptionController.decryptMessage(latestMessage.sender.toString(), latestMessage.message)
                    latestMessage.message = decryptedMessage
                }
                return {
                    ...user.toObject(),  // Spread the user data
                    latestMessage: latestMessage || null,  // Add the latest message data
                };
            })
        );

        res.status(200).json({ users: usersWithMessages });
    } catch (err) {
        res.status(500).json({ message: 'Server error ' + err })
    }
};


const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const user = await model.User.findById(userId).populate('unreads')
        if (!user) {
            res.status(404).json({ message: 'user not found' })
            return
        }

        const latestMessage = await model.Message.findOne({
            $or: [
                { sender: userId, receiver: user._id },
                { sender: user._id, receiver: userId }
            ]
        }).sort({ createdAt: -1 }).exec();
        if (latestMessage) {
            const decryptedMessage = await decryptionController.decryptMessage(latestMessage.sender.toString(), latestMessage?.message);
            latestMessage.message = decryptedMessage

        }
        const userObject = {
            _id: user._id.toString(),
            username: user.username,
            names: user.names,
            email: user.email,
            image: user.image,
            unreads: user.unreads,
            lastActiveTime: user.lastActiveTime,
            latestMessage: latestMessage
        } as unknown as User

        res.status(200).json({ user: userObject })
    } catch (err) { res.status(500).json({ message: 'Server error ' + err }) }
};

const getUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await model.User.findById(userId).select('_id username names email image lastActiveTime groups ');
        if (!user) {
            res.status(404).json({ message: 'user not found' });
            return
        }
        const userObject = {
            _id: user._id,
            username: user.username,
            names: user.names,
            email: user.email,
            image: user.image,
            groups: user.groups,
            lastActiveTime: user.lastActiveTime
        }
        res.status(200).json({ user: userObject });
    } catch (err) { res.status(500).json({ message: 'Server error' + err }) }
};



const updateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const { error, value } = validator.updateUserSchema.validate(req.body)
        if (error) {
            res.status(400).json({ error: error.details })
            return
        }
        await model.User.findByIdAndUpdate(userId, { username: value.username, names: value.names, email: value.email });
        res.status(201).json({ message: 'user updated' });
    } catch (err) { res.status(500).json({ message: 'server error ', err }) }
}

const editUserPassword = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId
        const { oldPassword, newPassword } = req.body
        const user = await model.User.findById(userId).select('password');
        if (!user) {
            res.status(404).json({ message: 'user not found' });
            return
        }
        const validated = bcrypt.compareSync(oldPassword, user.password);
        if (!validated) {
            res.status(400).json({ message: 'Invalid password' })
            return
        };
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        await model.User.findByIdAndUpdate(userId, { password: hash });
        res.status(201).json({ message: 'user updated' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: 'server error ', err })
        }
    }
}

const editUserProfilePicture = async (req: Request, res: Response) => {
    try {
        const userId = res.locals.user.userId
        const { finalFileName } = req.body as { finalFileName: string }
        await model.User.findByIdAndUpdate(userId, { image: finalFileName })
        res.status(200).json({ message: 'profile picture updated successfull' })
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