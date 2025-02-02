// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const userRoutes = require("./Routes/userRoutes");
const cors = require("cors");
const connectDB = require("./config/db");
// Initialize dotenv
dotenv.config();
// Middleware
const app = express();
   // Connect to MongoDB
   connectDB();
 
app.use(cors({
  // origin:"http://localhost:5173",
  // methods:"GET,POST,PUT,DELETE",
  // allowedHeaders:"Content-Type,Authorization"
}))

app.use(bodyParser.json());

// Use Routes
app.use("/api/users", userRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Server running on port:${port}`);
})