const { body, validationResult } = require('express-validator');
const multer = require('../configs/multer.config');
const {removeImg, uploadImg } = require('../utils/profileImg');
const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

const getLastMessage = async (roomId) => {
  try {
    const lastMessage = await Message
    .findOne({room: roomId})
    .sort({createdAt: -1})
    .select('text createdAt')
    .lean();
    return lastMessage;
  } catch(err) {
    throw err
  }
}

exports.getUserRooms = async (req, res, next) => {
  try {
    const roomsPromise = Room
      .find({$and: [{$or: [{participants: req.user._id}, {admin: req.user._id}]}, {private: false}]})
      .select('-admin -participants -updatedAt');
    const privateRoomsPromise = Room
      .find({participants: req.user._id, private: true})
      .populate('participants', '-password -email');
    const [rooms, privateRooms] = await Promise.all([roomsPromise, privateRoomsPromise]);
    const privateRoomsUpd = privateRooms.map(oldRoom => {
      const room = oldRoom.toJSON();
      let partner = room.participants.find(user => user._id !== req.user._id);
      return {...room, name: partner.nickname, roomImgUrl: partner.profileImgUrl}
    })
    const roomsWithMsgPromises = [...rooms, ...privateRoomsUpd].map(async (oldRoom) => {
      let room;
      if (oldRoom.private) {
        room = oldRoom;
      } else {
        room = oldRoom.toJSON();
      }
      let lastMsg = await getLastMessage(room._id);
      if (!lastMsg) {
        lastMsg = {};
        lastMsg.text = `created at ${room.formatted_timestamp}`;
        lastMsg.createdAt = room.createdAt;
      };
      return {...room, lastMessage: lastMsg.text, lastTimestamp: lastMsg.createdAt};
    })
    const roomsWithMsg = await Promise.all(roomsWithMsgPromises)
    res.status(200).json({rooms: roomsWithMsg});
  } catch(err) {
    next(err);
  }
}

exports.getOtherRooms = async (req, res, next) => {
  try {
    const rooms = await Room
      .find({$and: [{participants: {$ne: req.user._id}}, {admin: {$ne: req.user._id}}, {private: false}]})
      .select('-admin -participants -updatedAt -formatted_timestamp')
      .sort({createdAt: -1});
    res.status(200).json({rooms});
  } catch(err) {
    next(err);
  }
}

exports.getRoomInfo = async (req, res, next) => {
  try {
    const roomInfo = await Room
      .findById(req.params.roomId)
      .populate('admin', 'nickname profileImgUrl')
      .populate('participants', 'nickname profileImgUrl');
    res.status(200).json({roomInfo});
  } catch(err) {
    next(err);
  }
}

exports.getUsersToInvite = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.roomId).lean();
    const participants = room['participants'];
    const admin = room['admin'];
    const notParticipants = await User
      .find(
        {_id: {$nin: [...participants, admin]}},
        'nickname profileImgUrl')
      .lean();
    res.status(200).json({users: notParticipants});
  } catch(err) {
    next(err);
  }
}

exports.createRoom = [
  body('name')
    .isLength({min: 1})
    .withMessage('room name must be specified')
    .isLength({max: 100})
    .withMessage('room name mustn\'t exceed 100')
    .escape(),
  async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({'errors': errors.array()});
    }
    const { name, participants } = req.body;
    const newRoom = new Room({name, participants, admin: req.user._id});
    const roomInfo = await newRoom.save();
    res.status(200).json({roomInfo});
  } catch(err) {
    next(err);
  }
}]

exports.joinRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndUpdate(
      req.params.roomId, 
      {$push: {'participants': req.user._id}});
    res.sendStatus(200);
  } catch(err) {
    next(err);
  }
}

exports.inviteToRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndUpdate(
      req.params.roomId,
      {$push: {'participants': req.body.userId}}
    )
    res.sendStatus(200);
  } catch(err) {
    next(err);
  }
}

exports.leaveRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.roomId, {$pull: {'participants': req.user._id}}, {new: true})
    res.status(200).json({room});
  } catch(err) {
    next(err);
  }
}

exports.privateRoom = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const checkingRoom = await Room.findOne({participants: [userId, req.user._id], private: true});
    let roomInfo;
    if (checkingRoom) {
      roomInfo = checkingRoom;
    } else {
      const newRoom = new Room({participants: [userId, req.user._id], private: true});
      roomInfo = await newRoom.save();
    }
    const partner = await User.findById(userId);
    const roomInfoJSON = roomInfo.toJSON();
    res.status(200).json({...roomInfoJSON, name: partner.nickname, roomImgUrl: partner.profileImgUrl});
  } catch(err) {
    next(err);
  }
}

exports.updateRoomName = [
  body('name')
    .isLength({min: 1})
    .withMessage('room name must be specified')
    .isLength({max: 100})
    .withMessage('room name mustn\'t exceed 100')
    .escape(),
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({'errors': errors.array()});
        }
        const { name } = req.body;
        const updRoom = await Room.findByIdAndUpdate(req.params.roomId, {name}, {new: true});
        res.status(200).json({updRoom});
      } catch(err) {
        next(err);
      }
    }]

exports.uploadRoomImg = [
  multer.single('roomImg'),
  body('roomImg')
    .custom((value, { req }) => {
      if (
        req.file?.mimetype !== 'image/jpeg'
        && req.file?.mimetype !== 'image/png'
        && req.file?.mimetype !== 'image/webp'
      ) {
        return false
      }
      return true;
    })
    .withMessage('Upload only image formats'),
  async(req, res, next) => {
    if (!req.file) {
      return res.status(400).json({message: 'no file attached'});
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    try {
      const currentRoom = await Room.findById(req.params.roomId);
      let oldImgId = currentRoom.roomImgId;
      if (oldImgId) {
        removeImg(oldImgId);
      }
      const fileResponse = await uploadImg(req.file);
      currentRoom.roomImgId = fileResponse.fileId;
      currentRoom.roomImgUrl = fileResponse.url;
      await currentRoom.save();
      res.status(200).json({roomImgUrl: currentRoom.roomImgUrl});
    } catch(err) {
      next(err);
    }
  }
]