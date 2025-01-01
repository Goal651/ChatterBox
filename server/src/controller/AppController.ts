import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import validator from '../validator/validator';
import model from '../model/model';
import { User, Group, GroupMember } from '../interface/interface'

const AES_KEY_LENGTH = 32;
const generateKeyPair = async () => {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.KEY_PASSPHRASE as string
            }
        }, (err, publicKey, privateKey) => {
            if (err) return reject(err);
            resolve({ publicKey, privateKey });
        });
    });
}
const readImage = async (imagePath: string) => {
    try {
        const imageBuffer = await fs.promises.readFile(imagePath);
        return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    } catch (err) {
        console.error('Error reading image:', err);
        return null;
    }
};

const generateGroupKeys = () => {
    try {
        const aesKey = crypto.randomBytes(AES_KEY_LENGTH);
        const privateKey = crypto.randomBytes(32).toString('hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
        let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'hex');
        encryptedPrivateKey += cipher.final('hex');
        return { encryptedPrivateKey, aesKey, iv }
    } catch (err) { throw err }
}

const decryptPrivateKey = async (encryptedPrivateKey: string): Promise<string> => {
    try {
        const keyObject = crypto.createPrivateKey({
            key: encryptedPrivateKey,
            format: 'pem',
            passphrase: process.env.KEY_PASSPHRASE
        });
        return keyObject.export({ type: 'pkcs1', format: 'pem' }) as string
    } catch (err) {
        console.error('Error decrypting private key:', err);
        throw err;
    }
};

const decryptGroupMessage = (data: { iv: string, privateKey: string, message: string }) => {
    try {
        if (!data) return
        const ivBuffer = Buffer.from(data.iv, 'hex')
        const aesKeyBuffer = Buffer.from(data.privateKey, 'hex')
        const encryptedMessage = Buffer.from(data.message, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer)
        let decryptedMessage = decipher.update(encryptedMessage, undefined, 'utf-8')
        decryptedMessage += decipher.final('utf-8')
        return decryptedMessage
    } catch (err) { console.error(err) }
}

const decryptGroupPrivateKey = (data: { aesKey: string, iv: string, encryptedPrivateKey: string }) => {
    const ivBuffer = Buffer.from(data.iv, 'hex')
    const aesKeyBuffer = Buffer.from(data.aesKey, 'hex')
    const encryptedPrivateKeyBuffer = Buffer.from(data.encryptedPrivateKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKeyBuffer, ivBuffer)
    let decryptedPrivateKey = decipher.update(encryptedPrivateKeyBuffer, undefined, 'utf8')
    decryptedPrivateKey += decipher.final('utf-8')
    return decryptedPrivateKey
}

const decryptMessage = async (privateKey: string, encryptedMessage: string) => {
    try {
        return crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            },
            Buffer.from(encryptedMessage, 'base64')
        ).toString('utf-8');
    } catch (err) {
        console.error('Error decrypting message:', err);
        throw err;
    }
};

const getPrivateKey = async (email: string) => {
    try {
        const user = await model.User.findOne({ email: email }).select('privateKey')
        return user?.privateKey;
    } catch (error) {
        throw error;
    }
};




const groupDetails = async (group: string) => {
    try {
        const gms = await model.GMessage.find({ group: group })
        let images = 0
        let videos = 0
        let audios = 0
        await Promise.all(gms.map(async (gm) => {
            if (gm.type.startsWith('image')) images += 1
            else if (gm.type.startsWith('video')) videos += 1
            else if (gm.type.startsWith('audio')) audios += 1
        }))
        return { images, videos, audios }
    }
    catch (err) { return { images: 0, videos: 0, audios: 0 } }
}


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
        const { publicKey, privateKey } = await generateKeyPair() as { publicKey: string, privateKey: string };
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
        const user = await model.User.findOne({ email: email }).select('email password');
        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' })
            return
        };
        const validated = bcrypt.compareSync(password, user.password);
        if (!validated) {
            res.status(400).json({ message: 'Invalid email or password' })
            return
        };
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
            .populate('latestMessage')
            .skip(numberOfUsersToSkip)
            .limit(10)

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

const updateUserPhoto = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const image: { imageUrl: string } = req.body;
        await model.User.findByIdAndUpdate(userId, { image: image.imageUrl });
        res.status(201).json({ message: 'user updated' });
    } catch (err) { res.status(500).json({ message: 'server error ', err }) }
};


const updateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const { username, names, newEmail } = req.body as { username: string, names: string, newEmail: string };
        await model.User.findByIdAndUpdate(userId, { username, names, email: newEmail });
        res.status(201).json({ message: 'user updated' });
    } catch (err) { res.status(500).json({ message: 'server error ', err }) }
}


const createGroup = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const { error, value } = validator.groupCreationSchema.validate(req.body)
        if (error) {
            res.status(400).json({ message: error.details[0].message })
            return
        }
        const { groupName, image } = value as { groupName: string, image: string }

        const existingGroup = await model.Group.findOne({ groupName });
        if (existingGroup) {
            res.status(400).json({ message: 'Sorry that name is taken' });
            return
        }
        const { aesKey, encryptedPrivateKey, iv } = generateGroupKeys()
        const newGroup = new model.Group({
            groupName,
            admin: userId,
            image,
            members: [{ member: userId, role: 'admin' }],
            aesKey: aesKey.toString('hex'),
            iv: iv.toString('hex'),
            encryptedPrivateKey
        });
        await newGroup.save();
        await model.User.findByIdAndUpdate(userId, { $push: { groups: newGroup.toObject()._id } });
        res.status(201).json({ message: 'Group created successfull' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' + err });
    }
};

const getGroups = async (req: Request, res: Response) => {
    try {
        const { userId } = res.locals.user;
        const page = req.headers.page as unknown as number
        const numberOfGroupsToSkip = 10 * page
        const user = await model.User.findById(userId)
            .select('groups')
            .populate({
                path: 'groups',
                populate: {
                    path: 'latestMessage'
                }
            })
            .limit(10)
            .skip(numberOfGroupsToSkip)


        const groups = user?.toObject().groups as unknown as Group[]
        if (!groups) {
            res.status(404).json({ message: 'group not found' })
            return
        }
        if (groups.length <= 0) {
            res.status(200).json({ groups: null })
            return
        }
        const groupsWithImages = groups.map(async (group) => {
            const { aesKey, iv, encryptedPrivateKey } = group as { aesKey: string, iv: string, encryptedPrivateKey: string }
            if (!encryptedPrivateKey) return
            let lastMessage
            let imageData = null
            const privateKey = decryptGroupPrivateKey({ aesKey, iv, encryptedPrivateKey })
            const latestMessage = group.latestMessage

            if (latestMessage) {
                let message = ''
                if (latestMessage.type == 'text') {
                    message = decryptGroupMessage({ privateKey, iv, message: latestMessage.message }) as string
                } else message = 'sent file'
                lastMessage = { ...latestMessage, message }
            }
            const details = await groupDetails(group.groupName)
            if (group.image) imageData = await readImage(group.image);

            return {
                id: group._id,
                name: group.groupName,
                members: group.members,
                image: group.image,
                imageData,
                latestMessage: lastMessage,
                details
            }
        });
        res.status(200).json({ groups: groupsWithImages });
    } catch (err) {
        res.status(500).json({ message: 'Server error' + err });
    }
};

const getGroup = async (req: Request, res: Response) => {
    try {
        const { groupName } = req.params;
        const { userId } = res.locals.user
        const group = await model.Group.findOne({ groupName }).populate({
            path: 'members.member',
            select: 'username email image',
        }) as unknown as Group;

        if (!group) {
            res.status(404).json({ message: 'Group not found' })
            return
        }
        const groupMembers = group.members as unknown[] as GroupMember[]
        if (!groupMembers.some((member) => member.member._id === userId)) {
            res.status(400).json({ message: 'Group not found' })
        }
        const details = await groupDetails(group.groupName)
        const members = groupMembers.map(async (member) => {
            if (!member) return null
            return {
                id: member.member._id,
                username: member.member.username,
                names: member.member.names,
                email: member.member.email,
                image: member.member.image,
                role: member.role,
            }
        }) as unknown[] as User[];

        const memberImages = await Promise.all(members.map(async (user) => {
            if (!user) return null;
            const imageData = user.image ? await readImage(user.image) : ''
            return { ...user, imageData };
        }));

        const groupImageData = group.image ? await readImage(group.image) : null;

        const groupObject = {
            id: group._id,
            groupName: group.groupName,
            admins: group.admins,
            members: memberImages,
            image: group.image,
            imageData: groupImageData,
            latestMessage: null,
            details
        }
        res.status(200).json({ group: groupObject });
    } catch (err) {
        res.status(500).json({ message: 'Server error' + err });
    }
};

const updateGroup = async (req: Request, res: Response) => {
    try {
        const { group } = req.params
        const filePath = req.body as string
        const isGroupThere = await model.Group.findOne({ name: group })
        if (!isGroupThere) {
            res.status(404).json({ message: 'Group not found' })
            return
        }
        await model.Group.updateOne({ name: group }, { image: filePath })
        res.status(200).json({ message: 'group updated' })
    } catch (err) {
        res.status(500).json({ message: 'server error', err })
    }
}


const addMember = async (req: Request, res: Response) => {
    try {
        const { groupName, memberEmail } = req.body;
        const group = await model.Group.findOne({ name: groupName });
        if (!group) {
            res.status(404).json({ message: 'Group not found' })
            return
        }
        const user = await model.User.findOne({ email: memberEmail });
        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        }
        const groupMembers = group.members as unknown[] as GroupMember[]
        const isMember = groupMembers.some((member) => member.member.email === memberEmail);
        if (isMember) {
            res.status(400).json({ message: 'User is already a member' })
            return
        }
        group.members.push({ email: memberEmail });
        await group.save();
        user.groups.push(groupName);
        await user.save();
        res.status(200).json({ message: 'Member added successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Server error' + err });
    }
}
const ping = async (req: Request, res: Response) => {
    res.status(204).send()
}


export default {
    signup,
    login,
    getUsers,
    getUser,
    getGroups,
    getGroup,
    getUserProfile,
    createGroup,
    updateUserPhoto,
    updateUser,
    updateGroup,
    addMember,
    ping
};
