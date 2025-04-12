const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#ffffff',
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema); 