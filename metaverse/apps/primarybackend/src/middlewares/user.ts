import { NextFunction, Request,Response } from "express"
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

export const userAuthentication = async (req:Request,res:Response,next:NextFunction):Promise<any>=>{

    try{
        const header = req.headers.authorization;
        const authToken = header?.split(" ")[1];
        console.log("user middleware",req.headers.authorization)
        if(!authToken) return res.status(StatusCodes.FORBIDDEN).json({
            message:"Auth token not found, Login again"
        })
        // The ! at the end of process.env.JWT_TOKEN! is a TypeScript non-null assertion operator. It tells the TypeScript compiler, "I am certain that this value is not null or undefined, so don't complain about potential nullability issues."
        const payload = jwt.verify(authToken,process.env.JWT_TOKEN!) as {userId:string,role:"Admin" | "User"}

        console.log(payload);
        // return req.body.payload =payload;
        req.userId =payload.userId;
        req.role =payload.role;

        next()
        // return req;
        }
        catch(error){
            if(error === "JsonWebTokenError" || "TokenExpiredError "){
                return res.status(StatusCodes.FORBIDDEN).json({
                    message:"Invalid token, Login again"
                })
            }
            else {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message:"Internal server error"
                })
            }
    }
}
