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
        const { userId } = res.locals.user; // Assuming authentication middleware provides this
        const { error, value } = validator.groupCreationSchema.validate(req.body);
        console.log(value)

        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { groupName, description, members } = value as {
            groupName: string;
            image: string;
            description: string;
            members: string[];
        };

        // Check if the group name already exists
        const existingGroup = await model.Group.findOne({ groupName: groupName });
        if (existingGroup) {
            res.status(400).json({ message: 'Group name is already taken' });
            return;
        }

        // Ensure members list includes the creator and remove duplicates
        const uniqueMembers = new Set(members);
        uniqueMembers.add(userId); // Add the creator as a member

        const membersToBeSaved = Array.from(uniqueMembers).map((member) => ({
            member,
            role: member === userId ? 'admin' : 'member', // Assign role
        }))

        // Generate encryption keys for the group
        const { aesKey, encryptedPrivateKey, iv } = keyController.generateGroupKeys();

        // Prepare the new group document
        const newGroup = new model.Group({
            groupName: groupName,
            description,
            members: membersToBeSaved,
            aesKey: aesKey.toString('hex'),
            iv: iv.toString('hex'),
            encryptedPrivateKey,
        });
        console.log(newGroup.toJSON())

        // Save the new group
        await newGroup.save();

        // Update the creator's user document with the new group
        await model.User.updateMany(
            { _id: { $in: members } },
            { $addToSet: { groups: newGroup._id } }
        );


        res.status(201).json({ message: 'Group created successfully', groupId: newGroup._id });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` });
        console.error(err)
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
                select: 'groupName image members',
                populate: {
                    path: 'members.member',
                    select: 'username email image',
                }
            })

        const groups = user?.toObject().groups as unknown as Group[]

        if (!groups) {
            res.status(404).json({ groups: [] })
            return
        }

        if (groups.length <= 0) {
            res.status(200).json({ groups: [] })
            return
        }

        const groupsWithDetails = await Promise.all(groups.map(async (group) => {
            const details = await groupDetails(group.groupName)
            return { ...group, files: details }
        }))

        res.status(200).json({ groups: groupsWithDetails });
    } catch (err) {
        console.error(err)
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
        const { error, value } = validator.addMemberSchema.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { groupName, members } = value as { groupName: string; members: string[] };
        const group = await model.Group.findOne({ name: groupName });

        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }

        let newMembers: string[] = []

        for (const member of members) {
            const memberExists = group.members.some((m) => m.member.toString() === member)
            if (!memberExists) {
                newMembers.push(member)
            }
        }

        const resultMembers = newMembers.map((memberId) => ({
            member: memberId,
        }))

        await model.Group.findByIdAndUpdate(group._id, {
            $push: { members: { $each: resultMembers } }
        });

        res.status(200).json({ message: 'Members updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err });
    }
};


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
