const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: {type: String, maxLength: 100},
  admin: {type: Schema.Types.ObjectId, ref: 'User'},
  participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
  private: {type: Boolean, default: false},
  roomImgUrl: String,
  roomImgId: String
}, {
  timestamps: true,
  toJSON: {virtuals: true}
});

roomSchema.virtual('formatted_timestamp').get(function(){
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATETIME_MED);
})

module.exports = mongoose.model('Room', roomSchema);