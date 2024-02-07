const Room = require("../models/Room");

const fetchChats = async (user) => {
  const rooms = await Room.find({$or: [{participants: user.id}, {admin: user.id}]}).select('_id');
  return rooms;
}

module.exports = fetchChats;