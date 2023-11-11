const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {

  }); //created new instance of socket.io

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    }); //each socket fires a special disconnect event
    
  }); //listen on the connection event for incoming sockets


} 

module.exports = {initSocket};