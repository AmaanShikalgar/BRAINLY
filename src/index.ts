import dotenv from "dotenv";
dotenv.config();
import express from "express" ;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import {ContentModel, UserModel} from "./db";
import { userMiddleware } from "./middleware";
import { signupSchema, signinSchema, contentScheme } from "./zod";
const JWT_USER_SECRET = process.env.JWT_USER_SECRET!;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("Mongo Error:", err);
  });

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req,res)=>{

    const parsed = signupSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(411).json({
            message: "Error in credentials"
        });
    }

    const {email, password , firstName, lastName} = parsed.data;

    try{
        const  hashedPassword = await bcrypt.hash(password,5);

        await UserModel.create({
            email,
            password:hashedPassword,
            firstName,
            lastName
        });
        return res.status(200).json({
            message : "Signup Succeeded"
        });
    }catch(err){
        return res.status(403).json({
            message:"User Already Exists"
        });
    }
});

app.post("/api/v1/signin", async (req,res)=>{

    const parsed = signinSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(411).json({
            message:"error in credentials"
        });
    }

    const {email,password} = parsed.data;

    const existingUser = await UserModel.findOne({
        email
    });

    if(!existingUser){
        return res.status(403).json({
            message:"user not found"
        });
    }

    const passwordMatch = await bcrypt.compare(password,existingUser.password);

    if(!passwordMatch){
        return res.status(403).json({
            message:"invalid credentials"
        });
    }
        const token = jwt.sign({
            id: existingUser._id
        },JWT_USER_SECRET);

        return res.json({
            message:"Signin Successfully",token
        });
});


app.post("/api/v1/content", userMiddleware,async (req,res)=>{

    const parsed = contentScheme.safeParse(req.body);

    if(!parsed.success){
        return res.status(411).json({
            message: "Invalid content data"
        });
    }

    const{link,type,title} = parsed.data;
    try{
        await ContentModel.create({
            link,
            type,
            title,
            //@ts-ignore
            userId: req.userId,
            tags: []
        });

        return res.json({
            message:"Content Created"
        });
    }catch(err){
        return res.status(500).json({
            message:"Error creating content"
        });
    }
});

app.get("/api/v1/content",userMiddleware, async (req,res)=>{
    //@ts-ignore
    const userId = req.userId
    const content = await ContentModel.find({
        userId:userId
    })
    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req,res)=>{
    try{
        const {contentId} =req.body;

        const content = await ContentModel.findById(contentId);

        if(!content){
            return res.status(404).json({
                message:"Content not found"
            });
        }

        //@ts-ignore
        if(content.userId.toString()!== req.userId){
            return res.status(403).json({
                message: "you dont own this content"
            });
        }

        await ContentModel.deleteOne({ _id:contentId});

        return res.json({
            message:"Delete succeded"
        });
    }catch(err){
        return res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/v1/brain/share", (req,res)=>{

})

app.get("/api/v1/brain/:shareLink", (req,res)=>{

})

app.listen(3000, function(){
    console.log("running on port 3000")
})