const multer = require('multer');

//between disk storage and memory storage we choose memory one to avoid store files on the server
const storage = multer.memoryStorage();

module.exports = multer({ storage });