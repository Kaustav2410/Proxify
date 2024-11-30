Project: To create a game where people can create rooms and join rooms,explore the map and communicate with other people in the room

Bair minimum is to have a web socket server so that users can communicate with each other and see each other moving

The more optimal apporach would be that to have multiple websocket server and people who are part of the same room, should be connected to the same web socket server
Making the connection sticky
And if one of the web socket server goes down migrate the users of that server to a different web socket server

Architecture would be: - Web socket servers(multiple) + http server + database + router(which would route the users to the web socket server)


Services to be build
    Web socket service




Schema
https://www.notion.so/Websocket-Schema-1479f38c365f81ffa7d3c3a329b479a9
https://www.youtube.com/watch?v=aamk2isgLRk
User

id : string
username : string
password : string
avatarId : string
role : ["Admin","user"]

Avatar
id:string
name:string
imageUrl:string

Elements
id:string
imageUrl: string
height:number
width:number

Space

id:string
name:string
width:number
height:number
thumbinal: string

Map
id:string
width:number
height:number
name:string

MapElements
id:string
mapId:string
posX:number
posY:number
elementId:string

SpaceElements
id:string
spaceId:string
posX:number
posY:number
elementId:string


docker run -p 5432:5432 -e POSTGRES_PASSWORD=gout3038 -d postgres


https://www.geeksforgeeks.org/difference-between-req-query-and-req-params-in-express/?ref=asr1


    Room data structure before adding the features
           Room:Map<string,User[]>;

    Features to add
        Chat
        Proximaty Video
        Load balancer

        If still working on the project add games so that people in the same room can play games


        Chat:-
            Storage of the message is dependent on the meaning of space
                If the space is meant to be like one time use for example hosting an event or friends joining for a good time
                or it is meant to be like storing the all the history of chats to preserve the state of the space

            Do i need store them in the database
            Store them in memory
                But what if one of the server goes down then the data will be lost
            Store them in redis

            Room:Map<string,User[]> could be modified to this ->

                Room:Map<string,RoomDetails>

                interface RoomDetails {
                    users: User[];
                    messages: Message[];
                }
                interface Message{
                    id: string;
                    message:string,
                    name:string
                }

                name data member should be added in the User class it is not yet : TODO

                event listener on the websocket related to chat messages would be "chat-message"

                client side

                JSON.stringify({
                    "type":"chat-message",
                    "payload":{
                        "spaceId":spaceId,
                        "token":adminToken,
                        "message":message
                    }
                })

                server side

                JSON.stringify({
                    "type":"new-message",
                    "payload":{
                        "message":message
                    }
                })

                should I send only the newest message or the entirety of the messasge array everytime a new message is sent in the room
                Clients can maintain local state for the message array if necessary.

                Load Balancer
                    make the connection sticky based on the load(NGINX)

                    If a space is active, in one of the servers connect the user in that server, or if the user disconnects connect them back to the same server

                    And if the server goes down reconnect them to another server

                From the looks of it have to store the Room Map in redis
