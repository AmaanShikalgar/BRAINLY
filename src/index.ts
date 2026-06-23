import express = require("express") ;
import mongoose = require("mongoose");
import jwt = require("jsonwebtoken");
import bcrypt = require("bcrypt");


const app = express();

app.post("/api/v1/signup", async (req,res)=>{
    const {email, password , firstName, lastName} =req.body;

    try{
        const  hashedPassword = await bcrypt.hash(password,5);
    }
} )

app.post("/api/v1/signin", (req,res)=>{
    
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