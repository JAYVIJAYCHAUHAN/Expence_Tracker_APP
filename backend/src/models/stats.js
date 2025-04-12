const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  totalUsers: {
    type: Number,
    default: 10000
  },
  totalExpenses: {
    type: Number,
    default: 50000
  },
  satisfactionRate: {
    type: Number,
    default: 98
  }
});

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;