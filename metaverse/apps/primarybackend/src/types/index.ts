import z from "zod"

export const signUpSchema = z.object({
    username : z.string(),
    password : z.string().min(6),
    type: z.enum(["User","Admin"])
})
export const signInSchema = z.object({
    username : z.string(),
    password : z.string().min(6),
})
export const updateMetadataSchema = z.object({
    AvatarId:z.string()
})

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId:z.string().optional()
})
export const SpaceIdSchema = z.object({
    spaceId:z.string()
})
export const addElementSchema = z.object({
    spaceId:z.string(),
    elementId:z.string(),
    x:z.number(),
    y:z.number()
})
export const removeElementSchema = z.object({
    id:z.string()
})

export const createElementSchema = z.object({
    imageUrl:z.string(),
    height:z.number(),
    width:z.number(),
    static:z.boolean(),
})

export const updateElmentSchema = z.object({
    imageUrl : z.string()
})

export const createAvatarSchema = z.object({
    name:z.string(),
    imageUrl:z.string()
})

export const createMapSchema = z.object({
    thumbnail:z.string(),
    dimensions:z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    name:z.string(),
    mapElements: z.array(z.object({
        elementId:z.string(),
        x:z.number(),
        y:z.number(),
    }))
})


declare global{
    namespace Express {
        export interface Request{
            role:"Admin" | "User",
            userId: String
        }
    }
}
