import dotenv from "dotenv";
dotenv.config();
import express from "express" ;
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {UserModel} from "./db";
const JWT_USER_SECRET = process.env.JWT_USER_SECRET!;

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req,res)=>{
    const {email, password , firstName, lastName} =req.body;

    try{
        const  hashedPassword = await bcrypt.hash(password,5);

        await UserModel.create({
            email: email,
            password:hashedPassword,
            firstName,
            lastName
        });
        res.json({
            message : "Signup Succeeded"
        });
    }catch(err){
        res.status(403).json({
            message:"Invalid Credentials"
        });
    }
});

app.post("/api/v1/signin", async (req,res)=>{
    const {email,password} =req.body;

    const user = await UserModel.findOne({
        email:email
    });

    if(!user){
        return res.status(403).json({
            message:"user not found"
        });
    }

    const passwordMatch = await bcrypt.compare(password,user.password);

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        },JWT_USER_SECRET);
    }
} )


app.post("/api/v1/content", (req,res)=>{
    
} )

app.get("/api/v1/content", (req,res)=>{
    
} )

app.delete("/api/v1/content", (req,res)=>{
    
} )

app.post("/api/v1/brain/share", (req,res)=>{

})

app.get("/api/v1/brain/:shareLink", (req,res)=>{

})

app.listen(3000, function(){
    console.log("running on port 3000")
})