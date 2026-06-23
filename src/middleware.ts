import { NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
const JWT_USER_SECRET = process.env.JWT_USER_SECRET!;

export const userMiddleware = (req:Request,res:Response,next:NextFunction) =>{
    try{
        const header = req.headers["authorization"];

        const decoded = jwt.verify(header as string ,JWT_USER_SECRET) as jwt.JwtPayload;
        //@ts-ignore
        req.userId = decoded.id;
        next();
    }catch(err){
        res.status(403).json({
            message:"You are not logged in"
        });  
    }
};

