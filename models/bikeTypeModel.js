const mongoose = require('mongoose');

const bikeTypesSchema = new mongoose.Schema({
  bikeType: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
});

const BikeTypes = mongoose.model('bikeType', bikeTypesSchema);

module.exports = BikeTypes;
