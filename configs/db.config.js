const mongoose = require('mongoose');

module.exports = async () => {
  try{
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('MongoDb Connected');
  } catch(err) {
    console.log(err);
    throw err;
  }
}