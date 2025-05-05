const mongoose = require('mongoose');

// create a habit schema
const habitSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String
    },
    time: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dates: [{
        date: {
            type: String,
            required: true
        },
        complete: {
            type: String,
            enum: ['y', 'n', 'x', 'none'],
            default: 'none'
        }
    }]
}, {
    timestamps: true
});

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;