const express = require('express');
const { getUserRooms, createRoom, getOtherRooms, joinRoom, inviteToRoom, leaveRoom, privateRoom, updateRoomName, getUsersToInvite, uploadRoomImg, deleteRoom } = require('../controllers/roomController');
const { getMessages, createMessage } = require('../controllers/messageController');
const { accessTokenAuth } = require('../middlewares/authentication');

const router = express.Router();

router.use(accessTokenAuth);

router.get('/', getUserRooms);
router.get('/other', getOtherRooms);
router.get('/:roomId', getMessages);
router.get('/:roomId/users-to-invite', getUsersToInvite);
router.post('/create', createRoom);
router.post('/private', privateRoom);
router.post('/:roomId/delete', deleteRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/invite', inviteToRoom);
router.post('/:roomId/leave', leaveRoom);
router.post('/:roomId/update-name', updateRoomName);
router.post('/:roomId/set-image', uploadRoomImg);
router.post('/:roomId/create-message', createMessage);

module.exports = router;