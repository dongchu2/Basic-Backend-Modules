const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{type:String,
              required:true,
              unique:true,
              trim:true,
             },
    password:[type:String,
              required:true,
              unique:true,
              trim:true,
              }
  },{timestamps:true });

module.export = mongoose.model("User",userSchema);
                                       
  
