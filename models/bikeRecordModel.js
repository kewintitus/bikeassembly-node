const mongoose = require('mongoose');

const bikeRecordSchema = new mongoose.Schema({
  bikeType: {
    type: String,
    required: [true, 'Bike Type is required'],
  },
  bikeName: {
    type: String,
    required: [true, 'Bike Name is required'],
  },
  startedAt: {
    type: Date,
    required: [true, 'starting time is required'],
  },
  endsAt: {
    type: Date,
    required: [true, 'ending time is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  timeElapsedBeforeCancel: {
    type: Number,
  },
  username: {
    type: String,
    required: [true, 'A build should belong to a user'],
  },
});

const BikeRecord = mongoose.model('bikeRecord', bikeRecordSchema);

module.exports = BikeRecord;
