import express from 'express'
import groupController from '@/controller/GroupController'
import userController from '@/controller/UserController'
import messageController from '@/controller/MessageController'
import auth from '@/auth/AuthController'
import mediaController from '@/controller/MultimediaController'
import webPusherController from '@/controller/WebPusherController'
import notificationController from '@/controller/NotificationController'
import adminController from '@/admin/controller/userController'
import { isAdmin } from '@/middleware/isAdmin'
import EmailVerifierController from '@/controller/EmailVerifierController'

const router = express.Router()

//Authentication
router.get('/auth', auth.checkToken, auth.checkUser)
router.post('/login', userController.login)
router.get('/verify/:token',EmailVerifierController)

//pinging server
router.get('/ping', groupController.ping)

//apis for users
router.get('/getProfile', auth.checkToken, userController.getUserProfile);
router.get('/getUser/:email', auth.checkToken, userController.getUser)
router.get('/getUsers', auth.checkToken, userController.getUsers)
router.post('/signup', userController.signup)
router.put('/editUser/', auth.checkToken, userController.updateUser)
router.put('/editUserPassword', auth.checkToken, userController.editUserPassword)
router.put('/editUserProfilePicture', auth.checkToken, userController.editUserProfilePicture)

//apis for groups
router.get('/getGroups', auth.checkToken, groupController.getGroups);
router.get('/getGroup/:name', auth.checkToken, groupController.getGroup);
router.post('/createGroup', auth.checkToken, groupController.createGroup)
router.put('/editGroupProfile/:group', auth.checkToken, groupController.updateGroupPhoto)
router.put('/updateGroup/:groupId', auth.checkToken, groupController.updateGroup)
router.post('/addMember', auth.checkToken, groupController.addMember)

//apis for messages
router.get('/gmessage/:group', auth.checkToken, messageController.getGMessage)
router.get('/message/:receiverId', auth.checkToken, messageController.getMessage)


//apis for files
router.post('/uploadFile', auth.checkToken, mediaController.fileUpload)
router.get('/getFile/:fileName', auth.checkToken, mediaController.sendFile)

//apis for pusher
router.post('/webPusher/subscribe', auth.checkToken, webPusherController.webPusherController)

//apis for notifications
router.get('/getNotifications', auth.checkToken, notificationController.getNotification)

//apis for admin
router.get('/admin/stats', isAdmin, adminController.getAdminStats)

export default router;
