import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
import prisma from "@repo/db/client"
import { createAvatarSchema, createElementSchema, createMapSchema, updateElmentSchema } from "../types";

dotenv.config()

export const createElement = async(req:Request,res:Response):Promise<any>=>{
    try{
        const parseData = createElementSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"All required fields are needed to create an element"
            })
        }

        const element = await prisma.element.create({
            data:parseData.data
        })

        return res.status(StatusCodes.OK).json({
            id:element.id
        })

    }
    catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            mesage:"Error occured in the admin controller "
        })
    }
}
export const updateElement = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {elementId} = req.params;
        const parseData = updateElmentSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"All required fields are needed to udpate the element"
            })
        }
        const element = await prisma.element.update({
            where:{
                id:elementId
                },
                data:parseData.data
            })
            return res.status(StatusCodes.OK).json({
                message:"element updated successfully"
            })

    }
    catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            mesage:"Error occured in the admin controller "
        })
    }
}
export const createAvatar = async(req:Request,res:Response):Promise<any>=>{
    try{
        const parseData = createAvatarSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"All required fields are needed to create an avatar"
            })
        }
        const avatar = await prisma.avatar.create({
            data:parseData.data
        })
        return res.status(StatusCodes.OK).json({
            id:avatar.id
        })
    }
    catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            mesage:"Error occured in the admin controller "
        })
    }
}
export const createMap = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;
        const parseData = createMapSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"All required fields are needed to create a map"
            })
        }
        const dimensionsArray = parseData.data.dimensions.split("x");
        const height = Number(dimensionsArray[1]);
        const width = Number(dimensionsArray[0]) ;

        const mapCreation = prisma.$transaction(async()=>{
            const map = await prisma.map.create({
                data:{
                    name:parseData.data.name,
                    thumbnail:parseData.data.thumbnail,
                    width,
                    height,
                }
            })
            
            await prisma.mapElements.createMany({
                data:parseData.data.mapElements.map((ele)=>{
                    return{
                        mapId:map.id,
                        x:ele.x,
                        y:ele.y,
                        elementId:ele.elementId
                    }
                })
            })
            return map.id;
        })

        return res.status(StatusCodes.OK).json({
            id:mapCreation
        })
    }
    catch(error){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            mesage:"Error occured in the admin controller "
        })
    }
}
