//create user models and schema here
import mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const ObjectID = mongoose.Schema.Types.ObjectId;

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

const UserModel = mongoose.model("user",userSchema);
const ContentModel = mongoose.model("content",contentSchema);

module.exports={
    UserModel,
    ContentModel
}
