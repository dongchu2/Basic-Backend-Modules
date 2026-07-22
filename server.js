const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(
  cors({
    origin:"*",
  })
  );

app.use(express.json();

app.get("/",(reg,res)=>{
  res.send("backend is running");
});

app.use("/api/contact",contactRoutes);
app.use("/api/auth",authRoutes);
const PORT = process.env.PORT || 3001;

mongoose
        .connect(process.env.MONGODB_URL)
        .then(()=>{
          console.log("Mongo DB connected");
          app.listen(PORT,()=>{
            console.log('server running on http://localhost:${PORT}');
          });
        })
        .catch((error)=>{
          console.error("MongoDB connection failed:",error.message);
        });


