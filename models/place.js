const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
        title: { type: String, required: true},
        description: { type: String, required: true},
        image: { type: String, required: true},
        address: { type: String, required: true},
        location: {
          lat: { type: Number},
          lng: { type: Number},
        },
        creator: { type: mongoose.Types.ObjectId, ref: 'Users'},
});

module.exports = mongoose.model('Places', placeSchema);