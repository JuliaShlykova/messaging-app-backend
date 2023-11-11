const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Room = require('../models/Room');

exports.getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId).populate('admin', 'nickname profileImgUrl').populate('participants', 'nickname profileImgUrl');
    if (!room['participants'].some(user=>user._id===req.user._id)||!(room.admin._id===req.user._id)) {
      return res.status(200).json({access: false, room})
    }
    const messages = await Message
      .find({room: roomId})
      .sort({createdAt: -1})
      .populate('author', 'nickname profileImgUrl');
    res.status(200).json({messages, access: true});
  } catch (err) {
    next(err);
  }
}

exports.createMessage = [
  body('text')
  .isLength({min: 1})
  .withMessage('message must be specified')
  // maximum limit has been taken from facebook
  .isLength({max: 8000})
  .withMessage('message mustn\'t exceed 8000')
  .escape(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({'errors': errors.array()});
      }
      const { text } = req.body;
      const newMessage = new Message({ text, author: req.user._id, room: req.params.roomId });
      await newMessage.save();
      res.status(200).json({ message: newMessage });
    } catch(err) {
      next(err);
    }
}]