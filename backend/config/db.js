const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Initialize dotenv
dotenv.config();

// Connect to MongoDB

  const connectionDB= async()=>{
    try{
     await mongoose.connect(process.env.MONGO_URL)
     console.log("Connected to MongoDB")
    }
  catch(err){console.error("MongoDB connection error:", err)};
}
  module.exports=connectionDB;