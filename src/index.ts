import dotenv from "dotenv";
dotenv.config();
import express from "express" ;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ogs from 'open-graph-scraper';
import mongoose from "mongoose";
import crypto from 'crypto';
import {ContentModel, UserModel, LinkModel} from "./db";
import { userMiddleware } from "./middleware";
import { signupSchema, signinSchema, contentScheme } from "./zod";
const JWT_USER_SECRET = process.env.JWT_USER_SECRET!;
import cors from "cors";


async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

start();
  
const app = express();

app.use(cors({
      origin: ["http://localhost:5173",
      "https://your-frontend.vercel.app"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
  }));
  
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
    } catch(err: any) {
        if(err.code === 11000){
            return res.status(409).json({ message: "Content already exists" });
        }
        return res.status(500).json({ message: "Error creating content" });
    }
});

app.get("/api/v1/content",userMiddleware, async (req,res)=>{
    //@ts-ignore
    const userId = req.userId
    const content = await ContentModel.find({
        userId:userId
    }).populate("userId","firstName")
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

app.post("/api/v1/preview", userMiddleware, async (req, res) => {
    try {
        const { url } = req.body;
        const { result } = await ogs({ 
            url,
            fetchOptions: {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });
        return res.json({
            title: result.ogTitle || "",
            description: result.ogDescription || "",
            image: result.ogImage?.[0]?.url || "",
            siteName: result.ogSiteName || ""
        });
    } catch (err) {
        return res.status(500).json({ message: "Could not fetch preview" });
    }
});

app.post("/api/v1/brain/share", userMiddleware,async(req,res)=>{
    const{share}=req.body;
    //@ts-ignore
    const userId = req.userId;
    try{
        if(share){
            const existingLink = await LinkModel.findOne({
                userId
            });

            if(existingLink){
                return res.json({
                    link: existingLink.hash
                });
            }

            const hash = crypto.randomBytes(8).toString('hex');

            await LinkModel.create({
                hash,userId
            });

            return res.json({
                link:hash
            });
        }

        await LinkModel.deleteOne({
            userId
        });

        return res.json({
            message:"Sharing disabled"
        });
    }catch(err){
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

app.get("/api/v1/brain/:shareLink", async(req,res)=>{
    try{
        const hash = req.params.shareLink;

        const link = await LinkModel.findOne({
            hash
        });

        if(!link){
            return res.status(404).json({
                message: "Invalid share link"
            });
        }

        const content = await ContentModel.find({
            userId: link.userId
        });

        const user = await UserModel.findById(link.userId);

        return res.json({
            username: user?.firstName,
            content
        });

    }catch(err){
        return res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});