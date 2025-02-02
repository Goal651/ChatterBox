import express from 'express'
import groupController from '../controller/GroupController'
import userController from '../controller/UserController'
import messageController from '../controller/MessageController'
import auth from '../auth/AuthController'
import mediaController from '../controller/MultimediaController'
import webPusherController from '../controller/WebPusherController'
const router = express.Router()

//Authentication
router.get('/auth', auth.checkToken, auth.checkUser)
router.post('/login', userController.login)

//pinging server
router.get('/ping', groupController.ping)

//apis for users
router.get('/getUserProfile', auth.checkToken, userController.getUserProfile);
router.get('/getUser/:email', auth.checkToken, userController.getUser)
router.get('/getUsers', auth.checkToken, userController.getUsers)
router.post('/signup', userController.signup)
router.put('/editUser/', auth.checkToken, userController.updateUser)
router.put('/editUserPassword', auth.checkToken, userController.editUserPassword)
router.put('/editUserProfilePicture',auth.checkToken,userController.editUserProfilePicture)

//apis for groups
router.get('/getGroups', auth.checkToken, groupController.getGroups);
router.get('/getGroup/:name', auth.checkToken, groupController.getGroup);
router.post('/createGroup', auth.checkToken, groupController.createGroup)
router.put('/editGroupProfile/:group', auth.checkToken, groupController.updateGroup)
router.put('/updateGroupProfile/:group', auth.checkToken, groupController.updateGroup)
router.post('/addMember', auth.checkToken, groupController.addMember)

//apis for messages
router.get('/gmessage/:group', auth.checkToken, messageController.getGMessage)
router.get('/message/:receiverId/:phase', auth.checkToken, messageController.getMessage)

//apis for files
router.post('/uploadFile', auth.checkToken, mediaController.fileUpload)
router.get('/getFile/:fileName', auth.checkToken, mediaController.sendFile)

//apis for pusher
router.post('/webPusher/subscribe', auth.checkToken,webPusherController.webPusherController)


export default router;