const express = require("express");
const User = require("../models/User");
const router = express.Router();
router.post("/register",async(req,res)=>{
  try{
    const{ username,password } = req.body;
    if(!username || !password){
      return res.status(400).json({ message:"Missing fields"})l
    }
    const existingUser = await User.findOne({ username });
    if(existingUser){
      return res.status(400).json({message:Username exists"});
    }
    const newUser = await User.create({ username, password });
    return res.status(201).json({ message:"Registered succesfully",user:newUser});
  }catch(error){
    return res.status(500).json({message:"Server error"});
  }
});

router.post("/login",async(req,res)=>{
  try{
    const {username,password}=req.body;
    const user = await User.findOne({ username});
    if (!user || user.password !== password){
      return res.status(401).json({message:"invalid crdentials"});
    }
    return res.status(200).json({
      message:"Login succesful",
      user:{ id: user._id,username:user.username}
    });
  }catch(error){
    return res.status(500).json({message:"Server error"});
  }
});
module.exports = router;
    
