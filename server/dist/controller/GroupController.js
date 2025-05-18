"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("../validator/validator"));
const model_1 = __importDefault(require("../model/model"));
const KeysController_1 = __importDefault(require("../security/KeysController"));
const groupDetails = (group) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gms = yield model_1.default.GMessage.find({ group: group });
        let images = 0;
        let videos = 0;
        let audios = 0;
        yield Promise.all(gms.map((gm) => __awaiter(void 0, void 0, void 0, function* () {
            if (gm.type.startsWith('image'))
                images += 1;
            else if (gm.type.startsWith('video'))
                videos += 1;
            else if (gm.type.startsWith('audio'))
                audios += 1;
        })));
        return { images, videos, audios };
    }
    catch (err) {
        return { images: 0, videos: 0, audios: 0 };
    }
});
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        // Validate request body
        const { error, value } = validator_1.default.groupCreationSchema.validate(req.body);
        if (error) {
            res.status(200).json({ message: error.details[0].message, isError: true });
            return;
        }
        const { groupName, description, members } = value;
        // Check if group name is already taken
        const existingGroup = yield model_1.default.Group.findOne({ groupName }).select('_id');
        if (existingGroup) {
            res.status(400).json({ message: 'Group name is already taken', isError: true });
            return;
        }
        // Ensure the creator is in the group and remove duplicates
        const uniqueMembers = Array.from(new Set([...members, userId]));
        // Assign roles (admin for creator, member for others)
        const membersToBeSaved = uniqueMembers.map((member) => ({
            member,
            role: member === userId ? 'admin' : 'member',
        }));
        // Generate cryptographic keys
        const keys = KeysController_1.default.generateGroupKeys();
        if (!keys || !keys.aesKey || !keys.iv || !keys.encryptedPrivateKey) {
            res.status(200).json({ message: 'Group creatioon failed please try again later', isError: true });
            return;
        }
        // Create and save the new group
        const newGroup = new model_1.default.Group({
            groupName,
            description,
            members: membersToBeSaved,
            aesKey: keys.aesKey.toString('hex'),
            iv: keys.iv.toString('hex'),
            encryptedPrivateKey: keys.encryptedPrivateKey,
        });
        yield Promise.all([
            newGroup.save(),
            model_1.default.User.updateMany({ _id: { $in: uniqueMembers } }, { $addToSet: { groups: newGroup._id } }),
        ]);
        res.status(200).json({ message: 'Group created successfully', isError: false });
    }
    catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
});
const getGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.user;
        const user = yield model_1.default.User.findById(userId)
            .select('groups')
            .populate({
            path: 'groups',
            select: 'groupName image members description',
            populate: {
                path: 'members.member',
                select: 'username email image',
                model: 'User'
            }
        });
        const groups = user === null || user === void 0 ? void 0 : user.toObject().groups;
        if (!groups) {
            res.status(200).json({ groups: [], isError: false });
            return;
        }
        if (groups.length <= 0) {
            res.status(200).json({ groups: [], isError: false });
            return;
        }
        const groupsWithDetails = yield Promise.all(groups.map((group) => __awaiter(void 0, void 0, void 0, function* () {
            const details = yield groupDetails(group.groupName);
            const latestMessage = yield model_1.default.GMessage.findOne({ group: group._id })
                .populate('sender')
                .sort({ createdAt: -1 })
                .exec();
            return Object.assign(Object.assign({}, group), { files: details, latestMessage });
        })));
        res.status(200).json({ groups: groupsWithDetails, isError: false });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupName } = req.params;
        const { userId } = res.locals.user;
        const group = yield model_1.default.Group.findOne({ groupName }).populate({
            path: 'members.member',
            select: 'username email image',
        });
        if (!group) {
            res.status(200).json({ message: 'Requested group couldnt be found', isError: true });
            return;
        }
        const groupMembers = group.members;
        if (!groupMembers.some((member) => member.member._id === userId)) {
            res.status(200).json({ message: 'Requested group was not found', isError: true });
        }
        const details = yield groupDetails(group.groupName);
        const groupObject = {
            id: group._id,
            groupName: group.groupName,
            admins: group.admins,
            latestMessage: null,
            details
        };
        res.status(200).json({ group: groupObject, isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
const updateGroupPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { group } = req.params;
        const filePath = req.body;
        const isGroupThere = yield model_1.default.Group.findOne({ name: group });
        if (!isGroupThere) {
            res.status(200).json({ message: 'Group photo was not updated', isError: true });
            return;
        }
        yield model_1.default.Group.updateOne({ name: group }, { image: filePath });
        res.status(200).json({ message: 'group updated', isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'server error', err });
    }
});
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validator_1.default.addMemberSchema.validate(req.body);
        if (error) {
            res.status(200).json({ message: error.details[0].message, isError: true });
            return;
        }
        const { groupName, members } = value;
        const group = yield model_1.default.Group.findOne({ name: groupName });
        if (!group) {
            res.status(200).json({ message: 'Group not registered', isError: true });
            return;
        }
        let newMembers = [];
        for (const member of members) {
            const memberExists = group.members.some((m) => m.member.toString() === member);
            if (!memberExists) {
                newMembers.push(member);
            }
        }
        const resultMembers = newMembers.map((memberId) => ({
            member: memberId,
        }));
        yield model_1.default.Group.findByIdAndUpdate(group._id, {
            $push: { members: { $each: resultMembers } }
        });
        res.status(200).json({ message: 'Members updated successfully', isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error: ' + err });
    }
});
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const { groupName, description, members } = req.body;
        // Fetch the existing group to get current members
        const group = yield model_1.default.Group.findById(groupId);
        if (!group) {
            res.status(200).json({ message: 'Group not found. Please try again later', isError: true });
            return;
        }
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
        yield model_1.default.Group.updateOne({ _id: groupId }, { groupName, description, members: updatedMembers });
        // Add the group to the new users
        yield model_1.default.User.updateMany({ _id: { $in: members } }, { $addToSet: { groups: groupId } });
        res.status(200).json({ message: 'Group updated successfully', isError: false });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
const ping = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(204).send();
});
exports.default = {
    getGroups,
    getGroup,
    createGroup,
    updateGroupPhoto,
    addMember,
    updateGroup,
    ping
};
