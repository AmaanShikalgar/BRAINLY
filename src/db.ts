//create user models and schema here
import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb+srv://admin:1234@cluster0.tkt131r.mongodb.net/BRAINLY")

const userSchema = new Schema ({
    email: {type:String, unique:true, required:true},
    password: {type:String , required:true},
    firstName: String,
    lastName: String
});

const contentSchema = new Schema ({
    type : {type:String , required:true},
    link : {type:String},
    title: {type:String},
    tags : {type:String}
})

export const UserModel = model("user",userSchema);
export const ContentModel = model("content",contentSchema);