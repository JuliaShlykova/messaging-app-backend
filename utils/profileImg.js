const imageKit = require('../configs/storage.config');

exports.removeImg = (file) => {
  imageKit.deleteFile(file, function(error, result) {
    if(error) console.log(error);
  })
}

exports.uploadImg = (file) => {
  return imageKit.upload({
    file: file.buffer.toString('base64'),
    fileName: file.originalname,
    useUniqueFileName: true
  })
}