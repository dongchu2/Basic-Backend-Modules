const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();
router.post("/", async(reg,res)=>{
    try{
        const {name,email,message}=req.body;
        if(!name||!email||!message){
          return res.status(400).json({
              message:"Name,email and messages are required"
        });
      }
      const newContact = await Contact.create({
        name,
        email,
        message,
        });
      return res.status(201).json({
        message:"message saved successfully",
        contact:newContact,
      });
} catch(error){
    console.error(error);
    return res.status(500).json({
      message:"server error",
    });
}
});

router.get("/",async(req,res)=>{
    try{
      const Contacts = await Contact.find().sort({
        createdAt:-1
      });
      return res.json(contacts);
    }catach(error){
        console.error(error);
        return res.status(500).json({
          message:"server error",
        });
      }
});
module.exports=router;
