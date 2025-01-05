import { Request, Response } from 'express';
import validator from '../validator/validator';
import model from '../model/model';
import { User, Group, GroupMember } from '../interface/interface'
import keyController from '../security/KeysController'


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
        const { aesKey, encryptedPrivateKey, iv } = keyController.generateGroupKeys()
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
        const groupWithDetails = await Promise.all(groups.map(async (group) => {
            const details = await groupDetails(group.groupName)
            return { ...group, ...details }
        }))
        const groupsWithImages = await Promise.all(groupWithDetails.map(async (group) => {
            return group
        }));

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



        const groupObject = {
            id: group._id,
            groupName: group.groupName,
            admins: group.admins,
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

    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    addMember,
    ping
};
