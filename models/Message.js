const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: {type: String, maxLength: 300, required: true},
  room: {type: Schema.Types.ObjectId, ref: 'Room'},
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true}
}, {
  timestamps: true,
  toJSON: {virtuals: true}
});

messageSchema.virtual('formatted_timestamp').get(function(){
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATETIME_MED);
})

module.exports = mongoose.model('Message', messageSchema);