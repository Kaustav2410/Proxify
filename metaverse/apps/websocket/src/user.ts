import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { WebSocket } from "ws";
import { RoomManager } from "./roomManager";
import prisma from "@repo/db/client"
import path from "path";

dotenv.config({path:path.resolve(__dirname,"../../../",".env")})

// Add a unqiue id to the current object so that we can identify the object when stored in the array of User (see RoomManager.ts file )
function uniqueId(length:number){
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
}

export class User {
    // Properties of user class

    public id:string;
    public userId?:string ;
    private spaceId?:string;
    private x:number ;
    private y:number ;
    private ws:WebSocket

    constructor( ws:WebSocket){
        this.id = uniqueId(10);
        this.x = 0;
        this.y = 0;
        this.ws=ws;
        this.initHandlers();
    }

    initHandlers(){
        // console.log("Inside of initHandlers function");
        this.ws.on("message",async(data)=>{


            const parseData = JSON.parse(data.toString());
            console.log("Inside of user class",parseData);

            // Verfiy the token

            // Based on the event type perform different tasks and send back
            // responses accordingly

            switch (parseData.type){
                case "join":{
                    // console.log("Inside of join case")
                    const userDetails= jwt.verify(parseData.payload.token ,process.env.JWT_TOKEN!) as {userId:string,role:["Admin","User"]};
                    this.userId = userDetails.userId

                    const spaceId =parseData.payload.spaceId;
                    this.spaceId =spaceId

                    const user = await prisma.user.findUnique({where:{id:this.userId}})
                    if(!user){
                        console.log("user doesnt exists");
                        this.ws.close()
                        return ;
                    }

                    // Find the space with the spaceId provided in the payload
                    // If the space with the spaceId is not present then
                    // close the websocket connection
                    const space = await prisma.space.findUnique({
                        where:{id:this.spaceId}
                    })

                    if(!space){
                        console.log("space doesn't exists");
                        this.ws.close()
                        return ;
                    }

                    this.x = Math.floor(Math.random()*space.width);
                    this.y = Math.floor(Math.random()*space.height);
                    // The users join in the space
                    const instance = RoomManager.getInstance();
                    instance?.adduser(spaceId,this);
                    // console.log("User added to the room",spaceId);
                    // message sent back to the client
                    this.send({
                        type:"space-joined",
                        payload:{
                            spawn:{
                                x:this.x,
                                y:this.y
                            }
                        },
                        users: RoomManager.getInstance()?.Room.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({id: u.id})) ?? []
                    });
                    RoomManager.getInstance()?.broadcast(spaceId,this,{
                        type:"user-joined",
                        payload:{
                            userId:this.userId,
                            x:this.x,
                            y:this.y
                        },
                    })
                    break;
                }
                case "move":{

                    // checks
                    // shouldn't be able to move more than one place be it horizontal or vertical
                    // Shouldn't be able to move out of bounds
                    // Shouldn't be able to move on top static objects placed in the space ??
                    // Shouldn't be able to move on top of other users  ??
                        console.log("Inside of move case",this.x,this.y);
                        if((parseData.payload.x<=this.x+1 && parseData.payload.x>=this.x-1) && (parseData.payload.y<=this.y+1 && parseData.payload.y>=this.y-1) ){
                            this.x = parseData.payload.x
                            this.y = parseData.payload.y
                            RoomManager.getInstance()?.broadcast(this.spaceId!,this,{
                                "type": "movement",
                                "payload": {
                                  "x": this.x,
                                  "y": this.y,
                                  "userId": this.userId
                                }
                            })
                            return ;
                        }
                        else this.send({
                            "type": "movement-rejected",
                            "payload": {
                                x: this.x,
                                y: this.y
                            }
                         })
                }
            }

        })
    }
    destroy() {
        RoomManager.getInstance()?.broadcast(this.spaceId!,this,{
            type: "user-left",
            payload: {
                userId: this.userId
            }
        });
        RoomManager.getInstance()?.removeUser(this.spaceId!,this);
    }
    send(message:any){
        this.ws.send(JSON.stringify(message))
    }
}
