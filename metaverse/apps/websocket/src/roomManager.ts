import type { User } from './user';

// Follows a singleton approach

export class RoomManager {
    // Stores all the spaces that are currently active and the id of the people present in it

    Room:Map<string,User[]>;

    static instance:RoomManager;

    private constructor(){
        this.Room = new Map();
    }

    // Function to get the singletion or to initialize the singleton
    static getInstance(){
        console.log("singleton fetched")
        if(!RoomManager.instance){
            this.instance = new RoomManager();
        }
        else return this.instance;
    }

    // Add user in the space with the spaceId and userId
    public adduser(spaceId:string,user:User){
        // console.log("In addUser function",spaceId,user);
        if(!this.Room.get(spaceId)){
             this.Room.set(spaceId,[user]);
             return;
        }
        this.Room.set(spaceId,[...(this.Room.get(spaceId) || []),user ])
    }
    public broadcast(spaceId:string,user:User,message:object){
        console.log("In broadcast function",message);
        if(this.Room.has(spaceId)){
            const users = this.Room.get(spaceId);
            users?.forEach(u => {
                if(u.userId!==user.userId) u.send(message)
            })
        }
        else return ;
    }
    public removeUser(spaceId:string,u:User){
        console.log("In remove function",spaceId);
        if(this.Room.has(spaceId)){
            const users = this.Room.get(spaceId);
            this.Room.set(spaceId,(users?.filter(user => u.id !== user.id) ?? []))
        }
    }
}
