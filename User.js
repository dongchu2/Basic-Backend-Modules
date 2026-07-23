const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username:{type:String,
              required:true,
              unique:true,
              trim:true,
             },
    password:{type:String,
              required:true,
              unique:true,
              trim:true,
              },
    status:{type:String,
            required:true,
            enum:["pending","approved","rejected"],
            default:"pending"
           }
        
  },{timestamps:true });

module.export = mongoose.model("User",userSchema);
                                       
  
