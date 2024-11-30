import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from 'express';
import prisma from "@repo/db/client"
import { createSpaceSchema,SpaceIdSchema,removeElementSchema,addElementSchema } from "../types";
dotenv.config()

export const createSpace = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;

        const parseData = createSpaceSchema.safeParse(req.body)
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Required fields to create a space are not specified"
              });
        }
        const user = await prisma.user.findUnique(
            {where: {id: userId as string}}
        )
        if(!user){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"User not found"
              });
        }
        const dimensionsArray = parseData.data.dimensions.split("x");
        const height = Number(dimensionsArray[1]);
        const width = Number(dimensionsArray[0]) ;
        if(!parseData.data.mapId){
            const newSpace = await prisma.space.create({
                data:{
                   name:parseData.data.name,
                   width,
                   height,
                   ownerId:userId as string
                }
            })

            return res.status(StatusCodes.OK).json({
                spaceId:newSpace.id
            })
        }
        else {
            const map = await prisma.map.findUnique({where:{id:parseData.data.mapId},
                select:{
                    mapElements:true,
                    height:true,
                    width:true
                }})

            if(!map){
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"Map not found"
                  });
            }

            const space =  prisma.$transaction(async()=>{
                const newSpace = await prisma.space.create({
                    data:{
                       name:parseData.data.name,
                       width:map.width ,
                       height:map.height,
                       ownerId:userId as string,
                    }
                })
                const spaceElements = await prisma.spaceElements.createMany({
                    data:map.mapElements.map((ele)=>{
                        return{
                            spaceId:newSpace.id,
                            elementId:ele.id,
                            x:ele.x as number,
                            y:ele.y!,
                        }
                    })
                })
                return newSpace.id;
            })

            return res.status(StatusCodes.OK).json({
                spaceId:space
            })
        }
    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }
}
export const deleteSpace = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;

        const parseData = SpaceIdSchema.safeParse(req.params)
        console.log("Inside of delete space function : ",parseData);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Spaceid is not defined to delete the space"
              });
        }
        const space = await prisma.space.findUnique(
            {where: {id: parseData.data.spaceId}}
        )
        if(!space){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Space not found in the delele space function"
              });
        }

        if(space.ownerId!==userId){
            return res.status(StatusCodes.FORBIDDEN).json({
                message:"User is not authorized to delete the space"
              });
        }
        await prisma.space.delete({where:{id:space.id}})
        return res.status(StatusCodes.OK).json({
            message:"Space deleted successfully"
            })

    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }
}
export const getSpaces = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;
        const spaces = await prisma.space.findMany({where:{ownerId:userId as string}})
        return res.status(StatusCodes.OK).json({
            spaces:spaces.map((space)=>{
                return {
                    id:space.id,
                    name:space.name,
                    dimensions:`${space.width}x${space.height}`,
                    thumbnail:space.thumbnail
                }
            })
        })
    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }

}
export const getSpace = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;
        const spaceId = req.params;
        const parseData = SpaceIdSchema.safeParse(spaceId);

        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:parseData.error
              });
        }

        const space = await prisma.space.findUnique({
            where: { id: parseData.data.spaceId },
            include: {
              elements: {
                select: {
                  id: true,
                  element:true,
                  x: true,
                  y: true,
                },
              },
            },
          });
        const dimensions = `${space?.width}x${space?.height}`
        return res.status(StatusCodes.OK).json({
            dimensions:dimensions,
            elements:space?.elements
          });

    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }
}
export const addElementToSpace = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;
        const parseData = addElementSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Necessary fields needed to add the element in the space are required"
              });
        }
        const space = await prisma.space.findUnique(
            {where: {id: parseData.data.spaceId,ownerId:userId as string}}
        )
        if(!space){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Space not found with the provided spaceId"
              });
        }
        if(space.height<parseData.data.y || space.height<parseData.data.x){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Position out of bounds"
              });
        }
        const element = await prisma.element.findUnique(
            {where: {id: parseData.data.elementId}}
        )
        if(!element){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"element not found with the provided elementId "
              });
        }

        if(space.ownerId!==userId){
            return res.status(StatusCodes.FORBIDDEN).json({
                message:"User is not authorized to modify the space"
              });
        }

        const spaceElement = await prisma.spaceElements.create(
             {data:parseData.data}
        )

        return res.status(StatusCodes.OK).json({
            id:spaceElement.id,
            message:"Element added to the space"
        })
    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }
}
export const deleteElementToSpace = async(req:Request,res:Response):Promise<any>=>{
    try{
        const {userId} = req;
        const parseData = removeElementSchema.safeParse(req.body);
        if(!parseData.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Necessary fields needed to delete the element in the space are required"
              });
        }
        const spaceElement = await prisma.spaceElements.findUnique(
            {where: {id: parseData.data.id},select:{space:true}}
        )
        if(spaceElement?.space.ownerId!==userId){
            return res.status(StatusCodes.FORBIDDEN).json({
                message:"User doesn't have the authorization to delete element from the space"
              });
        }

        await prisma.spaceElements.delete(
            {where: {id: parseData.data.id}}
        )
        return res.status(StatusCodes.OK).json({
            message:"Element removed successfully "
          });


    }
    catch (error: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
    }
}
