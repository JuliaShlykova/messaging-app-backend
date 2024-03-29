const express = require('express');
const { getUsers, udpateNickname, uploadUserImg, getOtherUserInfo } = require('../controllers/userController');
const {accessTokenAuth} = require('../middlewares/authentication');

const router = express.Router();

router.use(accessTokenAuth);
router.get('/', getUsers);
router.get('/:userNickname/getInfo', getOtherUserInfo);
router.post('/update-nickname', udpateNickname);
router.post('/upload-profile-img', uploadUserImg);

module.exports = router;