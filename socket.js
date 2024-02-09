const { Server } = require('socket.io');
const fetchChats = require('./utils/fetchChatsForSocket');
const transformLongMessage = require('./utils/transformLongMsg');

let onlineUsers = [];

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["https://messaging-app-frontend-two.vercel.app", "http://localhost:5000"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('login', async (user) => {
      if (!onlineUsers.some((onlineUser) => onlineUser.id === user.id)) {
        onlineUsers.push({...user, socketId: socket.id});
        const chats = await fetchChats(user);
        chats.forEach(chat => socket.join(chat._id.toString()));
      }
      io.emit('onlineUsers', onlineUsers);
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
      const index = onlineUsers.findIndex((onlineUser) => onlineUser.socketId === socket.id);
      if (index !== -1) onlineUsers.splice(index, 1);
      socket.broadcast.emit('onlineUsers', onlineUsers);
    });

    socket.on('getOnlineUsers', () => {
      io.to(socket.id).emit('onlineUsers', onlineUsers);
    })
    
    socket.on('createRoom', (room) => {
      let  participants = onlineUsers.filter(user => room.participants.includes(user.id)||(room.admin===user.id));
      for (let participant of participants) {
        io.sockets.sockets.get(participant.socketId).join(room.id);
      }
      io.emit('createRoom', {room});
    })

    socket.on('privateRoom', ({room, participantsInfo})  => {
      let  participants = onlineUsers.filter(user => room.participants.includes(user.id));
      for (let participant of participants) {
        io.sockets.sockets.get(participant.socketId).join(room.id);
      }
      io.to(room.id).emit('createRoom', {room, participantsInfo});
    })

    socket.on('message', (message) => {
      socket.to(message.room).emit('message', message);
      io.to(message.room).emit('lastMessage',{roomId: message.room, lastMsg: transformLongMessage(message.text)});
    })

    socket.on('renameRoom', ({roomId, newName}) => {
      io.to(roomId).emit('renameRoom', {roomId, newName});
    })

    socket.on('updateRoomImgUrl', ({roomId, roomImgUrl}) => {
      io.to(roomId).emit('newRoomImg', {roomId, roomImgUrl});
    })

    socket.on('deleteRoom', ({roomId}) => {
      io.emit('deleteRoom', {roomId});
    })
  });
} 

module.exports = {initSocket};