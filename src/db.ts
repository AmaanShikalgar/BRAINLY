//create user models and schema here
import mongoose , { Schema, model } from "mongoose";

const userSchema = new Schema ({
    email: {type:String, unique:true, required:true},
    password: {type:String , required:true},
    firstName: {type:String , required:true},
    lastName: {type:String , required:true}
});

const contentSchema = new Schema ({
    type : {type:String,
            enum: ["twitter","youtube","document","link","instagram","reddit"],
            required: true
    },
    link : {type:String,required:true,unique:true},
    title: {type:String},
    tags : [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId:{type: mongoose.Types.ObjectId, ref: 'user', required:true}
},{
    timestamps:true
});

const linkSchema = new Schema({
    hash:{type:String,unique:true,required:true},
    userId:{
        type: mongoose.Types.ObjectId,
        ref:"user",
        required:true,
        unique:true
    }
});


export const UserModel = model("user",userSchema);
export const ContentModel = model("content",contentSchema);
export const LinkModel = model("link",linkSchema);