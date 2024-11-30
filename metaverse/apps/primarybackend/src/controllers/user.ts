import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import prisma from "@repo/db/client"; // Importing the Prisma singleton


// Metadata Controller
export const metadata = async (req: Request, res: Response): Promise<any> => {
  try {
    const {avatarId} = req.body;
    const {userId} = req;

    const user = await prisma.user.findUnique(
        {where: {id: userId as string}}
    )
    if(!user){
        return res.status(StatusCodes.BAD_REQUEST).json({
            message:"User not found"
          });
    }
    const avatar = await prisma.avatar.findUnique({
        where: { id: avatarId },
    });

    if(!avatar){
        // console.log("Avatar not found with the id ",avatarId)
        return res.status(StatusCodes.BAD_REQUEST).json({
            message:"Avatar not found"
          });
    }

    await prisma.user.update({
        where:{id:userId as string},
        data:{avatarId}}
    )

    // Send success response with metadata
    return res.status(StatusCodes.OK).json({
      message:"Avatar update is successfull"
    }); // 200 OK
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    }); // 500 Internal Server Error
  }
};

// Bulk Metadata Controller
export const bulkmetadata = async (req: Request, res: Response): Promise<any> => {
  try {
      // Example logic: Fetch spaces with their elements
    //   console.log(typeof req.query.ids,req.query.ids);
      const bulkString = (req.query.ids || "[]") as string
      const idsArray = bulkString.slice(1,bulkString.length-1).split(",");
    const avatars = await prisma.user.findMany({
        where:{id: {in: idsArray}},
        select:{id:true,avatar: {
            select: { imageUrl: true },
          }}
    });

    // Send success response for bulk metadata
    return res.status(StatusCodes.OK).json({
        avatars
    }); // 200 OK

  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    }); // 500 Internal Server Error
  }
};
