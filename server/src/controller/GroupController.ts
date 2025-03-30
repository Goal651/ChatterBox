import { Request, Response } from 'express';
import validator from '../validator/validator';
import model from '../model/model';
import { Group, GroupMember } from '../interfaces/interface'
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

        // Validate request body
        const { error, value } = validator.groupCreationSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return
        }

        const { groupName, description, members } = value as {
            groupName: string;
            image: string;
            description: string;
            members: string[];
        };

        // Check if group name is already taken
        const existingGroup = await model.Group.findOne({ groupName }).select('_id');
        if (existingGroup) {
            res.json({ message: 'Group name is already taken' });
            return
        }

        // Ensure the creator is in the group and remove duplicates
        const uniqueMembers: string[] = Array.from(new Set([...members, userId]));

        // Assign roles (admin for creator, member for others)
        const membersToBeSaved = uniqueMembers.map((member) => ({
            member,
            role: member === userId ? 'admin' : 'member',
        }));

        // Generate cryptographic keys
        const keys = keyController.generateGroupKeys();
        if (!keys || !keys.aesKey || !keys.iv || !keys.encryptedPrivateKey) {
            res.status(400).json({ message: 'Group creation failed. Please try again later' });
            return
        }

        // Create and save the new group
        const newGroup = new model.Group({
            groupName,
            description,
            members: membersToBeSaved,
            aesKey: keys.aesKey.toString('hex'),
            iv: keys.iv.toString('hex'),
            encryptedPrivateKey: keys.encryptedPrivateKey,
        });

        await Promise.all([
            newGroup.save(),
            model.User.updateMany(
                { _id: { $in: uniqueMembers } },
                { $addToSet: { groups: newGroup._id } }
            ),
        ]);
        uniqueMembers.forEach(async (member) => {
            const newNotification = new model.Notification({
                title: groupName,
                userId: member,
                details: 'Welcome to group ' + groupName
            })
            await newNotification.save()
        });

        res.redirect('/')
    } catch (err) {
        console.error('Error creating group:', err);
        res.redirect('/error')
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
                select: 'groupName image members description',
                populate: {
                    path: 'members.member',
                    select: 'username email image',
                    model: 'User'
                }
            })
        const groups = user?.toObject().groups as unknown as Group[]

        if (!groups) {
            res.status(200).json({ groups: [] })
            return
        }

        if (groups.length <= 0) {
            res.status(200).json({ groups: [] })
            return
        }

        const groupsWithDetails = await Promise.all(groups.map(async (group) => {
            const details = await groupDetails(group.groupName)
            const latestMessage = await model.GMessage.findOne({ group: group._id })
                .populate('sender')
                .sort({ createdAt: -1 })
                .exec();
            return { ...group, files: details, latestMessage }
        }))

        res.status(200).json({ groups: groupsWithDetails });
    } catch (err) {
        console.error(err)
        res.redirect('/error')
    }
}

const getGroup = async (req: Request, res: Response) => {
    try {
        const { groupName } = req.params;
        const { userId } = res.locals.user
        const group = await model.Group.findOne({ groupName }).populate({
            path: 'members.member',
            select: 'username email image',
        }) as unknown as Group;

        if (!group) {
            res.status(400).json({ message: 'Group not found' })
            return
        }
        const groupMembers = group.members as unknown[] as GroupMember[]
        if (!groupMembers.some((member) => member.member._id === userId)) {
            res.status(400).json({ message: 'Group not found' })
        }
        const details = await groupDetails(group.groupName)

        const groupObject = {
            id: group._id,
            groupName: group.groupName,
            admins: group.admins,
            latestMessage: null,
            details
        }
        res.status(200).json({ group: groupObject });
    } catch (err) {
        console.error(err)
        res.redirect('/error')
    }
};

const updateGroupPhoto = async (req: Request, res: Response) => {
    try {
        const { group } = req.params
        const filePath = req.body as string
        const isGroupThere = await model.Group.findOne({ name: group })
        if (!isGroupThere) {
            res.status(400).json({ message: 'Group not found' })
            return
        }
        await model.Group.updateOne({ name: group }, { image: filePath })
        res.status(200).json({ message: 'group updated' })
    } catch (err) {
        res.redirect('/error')
        console.error(err)
    }
}


const updateGroup = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { groupName, description, members } = req.body as { groupName: string; description: string; members: string[] };

        // Fetch the existing group to get current members
        const group = await model.Group.findById(groupId);

        if (!group) {
            res.status(400).json({ message: 'Group not found' });
            return
        }

        const existingGroupMembers = group.members.map(member => member.member)

        // Merge new members with existing members if not already present
        const newMembers = members.map((member) => ({
            member,
            role: 'member'
        }));

        // Add new members to the group while preserving existing ones
        const updatedMembers = [
            ...group.members,
            ...newMembers.filter(newMember => !group.members.some(existing => existing.member.toString() === newMember.member.toString()))
        ];

        // Update the group with new members
        await model.Group.updateOne(
            { _id: groupId },
            { groupName, description, members: updatedMembers }
        );

        // Add the group to the new users
        await model.User.updateMany(
            { _id: { $in: members } },
            { $addToSet: { groups: groupId } }
        );

        existingGroupMembers.forEach(async member => {
            const newNotification = new model.Notification({
                title: group.groupName,
                userId: member,
                details: 'New user added ' + group.groupName
            })
            await newNotification.save()
        })
        res.status(200).json({ message: 'Group updated successfully' });
    } catch (err) {
        res.redirect('/error')
        console.error(err)
    }
};      


const ping = async (req: Request, res: Response) => {
    res.status(204).send()
}


export default {
    getGroups,
    getGroup,
    createGroup,
    updateGroupPhoto,
    updateGroup,
    ping
};
