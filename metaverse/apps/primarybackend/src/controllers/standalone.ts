import { signUpSchema, signInSchema } from "../types";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
import prisma from "@repo/db/client"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import bcryptjs from "bcryptjs"
// bcrypt and bcryptjs, no changes are required to the function parameters or usage style unless you rely on callbacks.

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../../..", ".env") });

// Sign-up Controller
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body against signUpSchema using safeParse
    // console.log(req.body);
    const validationResult = signUpSchema.safeParse(req.body);
    // console.log("Inside of signup function",validationResult);
    if (!validationResult.success) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error during signup",
        details: validationResult.error.errors,
      }); // 400 Bad Request
    }

    const data = validationResult.data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Username already exists",
      }); // 400 Bad Request
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(data.password,10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: data.type, // Map `type` to Role enum
      },
    });

    // Send success response
    return res.status(StatusCodes.OK).json({
      userId: newUser.id,
    }); // 200 OK
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    }); // 500 Internal Server Error
  }
};

// Sign-in Controller
export const signin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate request body against signInSchema using safeParse
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Validation error",
        details: validationResult.error.errors,
      }); // 403 Forbidden
    }

    const data = validationResult.data;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (!user) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid username or password",
      }); // 403 Forbidden
    }

    // Validate the password
    const isPasswordValid = await bcryptjs.compare(data.password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid username or password",
      }); // 403 Forbidden
    }

    // Create a JWT payload and sign it
    const payload = {
      userId: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_TOKEN!, {
      expiresIn: "24h", // Token expiry time
    });

    // Send success response with the token
    return res.status(StatusCodes.OK).json({
      token,
    }); // 200 OK
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    }); // 500 Internal Server Error
  }
};
export const getAllELements = async(req:Request,res:Response):Promise<any>=>{
    const elements = await prisma.element.findMany();

    return res.status(StatusCodes.OK).json({
        elements
    })
}
export const getAllAvatars = async(req:Request,res:Response):Promise<any>=>{
    const avatars = await prisma.avatar.findMany();

    return res.status(StatusCodes.OK).json({
        avatars
    })
}
