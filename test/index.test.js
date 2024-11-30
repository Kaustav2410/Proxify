// Example of jest
// function sum(a,b){
//     return a+b;
// }

// test('adds 1 + 2 to equal 3', () => {
//     expect(sum(1, 2)).toBe(3);
//   });
const axios2 = require("axios")

// Maybe create template of post,get,delete,delete operations where arugments are relative_url,data,token:optional and return the response in return ??????

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "http://localhost:3001";

const axios = {
    post:async(...args)=>{
        try{
            const response = await axios2.post(...args);
            return response ;
         }
         catch(error){
             return error.response;
         }
    },
    get:async(...args)=>{
        try{
            const response = await axios2.get(...args);
            return response ;
         }
         catch(error){
             return error.response;
         }
    },
    put:async(...args)=>{
        try{
            const response = await axios2.put(...args);
            return response ;
         }
         catch(error){
             return error.response;
         }
    },
    delete:async(...args)=>{
        try{
            const response = await axios2.delete(...args);
            return response ;
         }
         catch(error){
             return error.response;
         }
    }
}

async function userCreation(userType,username=undefined){
    const password = "abcdef";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
        username,
        password,
        type:userType
    })
    return response;
}
async function userLogin(username){
    const password = "abcdef";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
        username,
        password,
    })
    return response;
}


describe("Authentication",()=>{
    test("User is only able to sign up",async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        const response = await userCreation("User",username);
        expect(response.status).toBe(200)
    })
    test("Invalid input",async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        const usernameMissingResponse = await userCreation("User");
        expect(usernameMissingResponse.status ).toBe(400)

        const invalidTypeResponse = await userCreation("usseer",username);
        expect(invalidTypeResponse.status ).toBe(400)


    })
    test("Signin successfull if both the password and username matches",async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        await userCreation("User",username);

        const signInResponse = await userLogin(username);
        // console.log(signInResponse.data,"test");
        expect(signInResponse.data.token).toBeDefined()
        expect(Object.keys(signInResponse.data).length).toBe(1)
    })
    test("Signin fails if both the password and username are incorrect",async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        await userCreation("User",username);

        const signInResponse = await userLogin("wrongUsername");
        expect(signInResponse.status).toBe(403)
    })
})

describe("User metdata updation",()=>{
    let adminToken = "";
    let avatarId = "";
    beforeAll(async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        await userCreation("Admin",username);
        const signinResponse = await userLogin(username);
        adminToken = signinResponse.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
                "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                "name": "Timmy"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        avatarId = avatarResponse.data.id
    })

    test("User metadata fails when wrong avatarId is provided",async()=>{
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            "avatarId":"23242asdf"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(updatedResponse.status).toBe(400)
    })
    test("User metadata updates when correct avatarId is provided",async()=>{
        // console.log(avatarId);
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(updatedResponse.status ).toBe(200)
    })
    test("User metadata fails when auth token is not passed ",async()=>{
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            "avatarId":"23242asdf"
        })
        expect(updatedResponse.status ).toBe(403)
    })

})

describe("Get avatar information",()=>{
    let adminToken = "";
    let avatarId = "";
    let adminId = "";

    beforeAll(async()=>{
        const username = "Kaustav"+Math.floor(Math.random() * 10000);
        const signupResponse = await userCreation("Admin",username);

        adminId = signupResponse.data.userId;

        const signinResponse = await userLogin(username);
        adminToken = signinResponse.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
                "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                "name": "Timmy"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        avatarId = avatarResponse.data.id
    })

    test("Successfully get multiple users metadata provided their userId",async()=>{
        const metadataResponse = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${adminId}]`,{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(metadataResponse.data.avatars.length).toBe(1)
        expect(metadataResponse.data.avatars[0].id).toBe(adminId)

    })

    test("Successfully get the list of avatars currently present",async()=>{
        const avatarListResponse = await axios.get(`${BACKEND_URL}/api/v1/avatars`)

        const isAvatarPresent = avatarListResponse.data.avatars.find((x)=>x.id === avatarId);

        expect(isAvatarPresent).toBeDefined()


    })
})

describe("Space information",()=>{
    let userToken = "";
    let userId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    beforeAll(async()=>{
        const adminusername = "Kaustav"+Math.floor(Math.random() * 10000);
        const adminSignupResponse = await userCreation("Admin",adminusername);

        adminId = adminSignupResponse.data.userId;

        const adminSigninResponse = await userLogin(adminusername);
        adminToken = adminSigninResponse.data.token;


        const username = "Kaustav"+Math.floor(Math.random() * 10000) ;
        const userSignupResponse = await userCreation("User",username);

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await userLogin(username);
        userToken = userSigninResponse.data.token;

        element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
              "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
        },{
        headers:{
            "Authorization": `Bearer ${adminToken}`
        }
        })
        const element1Id = element1.data.id;
        const element2Id = element2.data.id;
        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "50 person interview room",
            "mapElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         })
         mapId = map.data.id;
    })

    test("Successfully create space given the map id ",async()=>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test",
            "dimensions":"100x200",
            mapId
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.data.spaceId).toBeDefined();
    })
    test("Successfully create space without the map id,empty space ",async()=>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test3",
            "dimensions":"100x200",
        },{
        headers:{
            "Authorization": `Bearer ${userToken}`
        }
        })
        expect(response.data.spaceId).toBeDefined();
    })
    test("user shouldn't be able to create space if name or dimensions field are missing ",async()=>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "dimensions":"100x200",
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
    })
        expect(response.status).toBe(400);
    })
    test("user shouldn't be able to delete space if id doesn't matches ",async()=>{
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomspace`,{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status ).toBe(400);
    })
    test("user should be able to delete ,space if id matches ",async()=>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test2",
            "dimensions":"100x200",
            mapId
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        console.log("Inside of test ",response.data);
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(deleteResponse.status ).toBe(200);
    })

    test("another user shouldn't be able to delete space even if the id matches ",async()=>{
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test24",
            "dimensions":"100x200",
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            "id":response.data.spaceId
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        console.log(deleteResponse);
        expect(deleteResponse.status ).toBe(403);
    })
})

describe("Arena Information",()=>{
    let userToken = "";
    let userId = "";
    let adminToken = "";
    let adminId = "";
    let element1 = "";
    let element2 = "";
    let mapId = "";
    let spaceId="";
    beforeAll(async()=>{
        const adminusername = "Kaustav"+Math.floor(Math.random() * 10000);
        const adminSignupResponse = await userCreation("Admin",adminusername);

        adminId = adminSignupResponse.data.userId;

        const adminSigninResponse = await userLogin(adminusername);
        adminToken = adminSigninResponse.data.token;


        const username = "Kaustav"+Math.floor(Math.random() * 10000) ;
        const userSignupResponse = await userCreation("User",username);

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await userLogin(username);
        userToken = userSigninResponse.data.token;

        element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
                "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                "width": 1,
                "height": 1,
              "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
        },{
        headers:{
            "Authorization": `Bearer ${adminToken}`
        }
        })
        const element1Id = element1.data.id;
        const element2Id = element2.data.id;
        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "50 person interview room",
            "mapElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         })
         mapId = map.data.id;

         const spaceInformation = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test3",
            "dimensions":"100x200",
        },{
        headers:{
            "Authorization": `Bearer ${userToken}`
        }
        })
        spaceId = spaceInformation.data.spaceId;
    })

    test("Get information related space given that spaceId is correct",async()=>{
        const spaceInformationResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(spaceInformationResponse.status).toBe(200);
    })
    test(" Successfully add element to space if the element exists with the elementId",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId,
            "x":20+Math.floor(Math.random()*20),
            "y":20+Math.floor(Math.random()*20),
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        // console.log("Inside : ", addElementResponse.data)
        expect(addElementResponse.status).toBe(200)
        expect(addElementResponse.data.id).toBeDefined()
    })
    test(" failed add element to space if the element position are out of bounds",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId,
            "posx":42244,
            "posy":9788,
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(addElementResponse.status).toBe(400)

    })
    test("Failed to add element to space if the elementId is invalid",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":"asdf2424",
            spaceId,
            "posx":20+Math.floor(Math.random()*20),
            "posy":20+Math.floor(Math.random()*20),
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(addElementResponse.status).toBe(400)
    })
    test("Failed to add element to space if the spaceId is invalid",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId:"42241asdasdf",
            "posx":20+Math.floor(Math.random()*20),
            "posy":20+Math.floor(Math.random()*20),
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(addElementResponse.status).toBe(400)
    })
    test("Successfully delete an element from the space given the correct id and token ", async () => {
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            elementId: element1.data.id,
            spaceId,
            x: 20 + Math.floor(Math.random() * 20),
            y: 20 + Math.floor(Math.random() * 20),
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json"
            }
        });

        console.log("addElement Response:", addElementResponse.data.id);

        const deleteElementResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            data: { id: addElementResponse.data.id }, // Correctly pass `id` under `data`
            headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json"
            }
        });

        console.log("removeElement Response:", deleteElementResponse.data);
        expect(deleteElementResponse.status).toBe(200);
    });

    test("Failed to delete an element from the space given the wrong id ",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId,
            "posx":20+Math.floor(Math.random()*20),
            "posy":20+Math.floor(Math.random()*20),
        })
        const deleteElementResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element`,
            {
                headers:{
                    "Authorization": `Bearer ${userToken}`
                }
            })
            expect(deleteElementResponse.status).toBe(400)
    })
    test("Failed to delete an element from the space if token is missing ",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId,
            "posx":20+Math.floor(Math.random()*20),
            "posy":20+Math.floor(Math.random()*20),
        })
        const deleteElementResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element`,
            {
                "id":"asdf24r2as2rsd"
            })
            expect(deleteElementResponse.status).toBe(403)
    })
    test("Failed to delete an element from the space if token is wrong ",async()=>{
        const addElementResponse = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1.data.id,
            spaceId,
            "posx":20+Math.floor(Math.random()*20),
            "posy":20+Math.floor(Math.random()*20),
        })
        const deleteElementResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/element`,
            {
                "id":addElementResponse.data.id
            },{
                headers:{
                    "Authorization": `Bearer alkjhoiubl422418798`
                }
            })
            expect(deleteElementResponse.status).toBe(403)
    })
    test("Successfully fetch all the elements from space ",async()=>{
        const addElementResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(addElementResponse.data.dimensions).toBe("100x200");
    })

})

describe("Admin Actions",()=>{
    let userToken = "";
    let userId = "";
    let adminToken = "";
    let adminId = "";
    beforeAll(async()=>{
        const adminusername = "Kaustav"+Math.floor(Math.random() * 10000);
        const adminSignupResponse = await userCreation("Admin",adminusername);

        adminId = adminSignupResponse.data.userId;

        const adminSigninResponse = await userLogin(adminusername);
        adminToken = adminSigninResponse.data.token;


        const username = "Kaustav"+Math.floor(Math.random() * 10000) ;
        const userSignupResponse = await userCreation("User",username);

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await userLogin(username);
        userToken = userSigninResponse.data.token;
    })
    test("Successfully created an new element",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(element1.data.id).toBeDefined();
    })
    test("Successfully updated an element",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const updatedResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${element1.data.id}`,{
            imageUrl:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(updatedResponse.status).toBe(200);
    })
    test("Failed to updated an element if imageUrl is missing",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const updatedResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${element1.data.id}`,{
            imageUrl:undefined
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })

        expect(updatedResponse.status).toBe(400);
    })
    test("Failed to updated an element if token is missing",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const updatedResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${element1.data.id}`,{
            imageUrl:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        })
        expect(updatedResponse.status).toBe(403);
    })
    test("Failed to updated an element if token is invalid",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        const updatedResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${element1.data.id}`,{
            imageUrl:"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(updatedResponse.status).toBe(403);
    })
    test("Successfully create a new avatar",async()=>{
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(avatarResponse.data.id).toBeDefined();
    })
    test("Failed to create a new avatar if token is wrong",async()=>{
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "name": "Timmy"
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(avatarResponse.status).toBe(403);
    })
    test("Failed to create a new avatar if imageUrl is missing",async()=>{
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "name": "Timmy"
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(avatarResponse.status).toBe(400);
    })
    test("Successfully create a new map",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "1002 person interview room",
            "mapElements": [{
                    elementId:element1.data.id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1.data.id,
                    x: 18,
                    y: 20
                }
            ]
         },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(mapResponse.data.id).toBeDefined();
    })
    test("Failed to create a new map if fields are missing",async()=>{
        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "1002 person interview room",
            "mapElements": [{
                    elementId:element1.data.id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1.data.id,
                    x: 18,
                    y: 20
                }
            ]
         },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(mapResponse.status).toBe(400);
    })
    // test("Failed to create a new map if elementId doesn't exists in the elements table",async()=>{
    //     const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
    //         "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    //         "width": 1,
    //         "height": 1,
    //       "static": true
    //         },{
    //         headers:{
    //             "Authorization": `Bearer ${adminToken}`
    //         }
    //     })
    //     const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
    //         "thumbnail": "https://thumbnail.com/a.png",
    //         "dimensions": "100x200",
    //         "name": "1002 person interview room",
    //         "mapElements": [{
    //                 elementId:"wrong_element_id",
    //                 x: 20,
    //                 y: 20
    //             }, {
    //               elementId: element1.data.id,
    //                 x: 18,
    //                 y: 20
    //             }
    //         ]
    //      },{
    //         headers:{
    //             "Authorization": `Bearer ${adminToken}`
    //         }
    //     })
    //     expect(mapResponse.status).toBe(400);
    // })
})



// // WebSockets Testing

describe("Web sockets test",()=>{
    let userToken;
    let userId;
    let adminToken;
    let adminId;
    let element1Id;
    let element2Id;
    let mapId;
    let spaceId;
    let ws1;
    let ws2;
    let ws1Messages=[];
    let ws2Messages=[];
    let userX;
    let userY;
    let adminX;
    let adminY;

    async function setUpHttp(){
        let username = `Kaustav ${Math.floor(Math.random()*100000)} `
        const user = await userCreation("User",username);

        userId = user.data.userId;
        // console.log("User")
        const userResponse = await userLogin(username);
        userToken = userResponse.data.token;

        let adminname = `Kaustav ${Math.floor(Math.random()*100000)} `
        const admin = await userCreation("Admin",adminname);

        adminId = admin.data.userId;
        const adminResponse = await userLogin(adminname);
        adminToken = adminResponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true
            },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element1Id = element1.data.id;
        element2Id = element2.data.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "50 person interview room",
            "mapElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        })
        mapId = map.data.id;

        const spaceInformation = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name":"Test3",
            "dimensions":"100x200",
            mapId
        },{
        headers:{
            "Authorization": `Bearer ${userToken}`
        }
        })
        spaceId = spaceInformation.data.spaceId;

    }

    async function setWebSocket(){

        // Create connection with the websocket server

        ws1 = new WebSocket(WS_URL);
        ws2 = new WebSocket(WS_URL);

        // wait till connection is established
        await new Promise ((resolve)=>{
            ws1.onopen = resolve
        })
        await new Promise ((resolve)=>{
            ws2.onopen = resolve
        })

        ws1.onmessage = (event)=>{
            console.log("event for the ws1",JSON.parse(event.data))
            ws1Messages.push(JSON.parse(event.data))
        }

        ws2.onmessage = (event)=>{
            console.log("event for the ws2",JSON.parse(event.data))
            ws2Messages.push(JSON.parse(event.data))
        }
    }
    // shortPolling could be the issue
    async function shortPolling(messageArray){
        console.log("Inside of the shortPolling function",messageArray);
        return new Promise((resolve)=>{
            if(messageArray.length>0) resolve(messageArray.shift());
            else {
                let intervalId = setInterval(() => {
                    if(messageArray.length>0) {
                        resolve(messageArray.shift());
                        clearInterval(intervalId);
                    }
                }, 100);
            }
        })
    }

    beforeAll(async()=>{
        await setUpHttp();
        await setWebSocket();
    })

    test("Get back ack for joining the space ",async ()=>{
        console.log("in websocket test",spaceId,adminToken);
        ws1.send(JSON.stringify({
            "type":"join",
            "payload":{
                "spaceId":spaceId,
                "token":adminToken
            }
        }))
        console.log("join event sent from the client side ");
        ws2.send(JSON.stringify({
            "type":"join",
            "payload":{
                "spaceId":spaceId,
                "token":userToken
            }
        }))
        console.log("join event sent from the client side (user) ");
        const message1 = await shortPolling(ws1Messages);
        userX = message1.payload.spawn.x
        userY = message1.payload.spawn.y
        // console.log(" messages fetched from the shortPolling function ",message1,);
        const message2 = await shortPolling(ws2Messages);
        const message3 = await shortPolling(ws1Messages);
        // console.log(" messages fetched from the shortPolling function ",message2);
        adminX = message2.payload.spawn.x
        adminY = message2.payload.spawn.y


        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.x).toBe(message2.payload.spawn.x);


    })

    test("User should not be able to across the boundary of the wall",async()=>{
        ws1.send(JSON.stringify({
            "type":"move",
            "payload":{
                "x":13212,
                "y":34234234
            }
        }))

        const message1 = await shortPolling(ws1Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(userX);
        expect(message1.payload.y).toBe(userY);
    })
    test("User should not be able to jump across the map",async()=>{
        // console.log(userX,userY);
        ws1.send(JSON.stringify({
            "type":"move",
            "payload":{
                "x":userX+2,
                "y":userY
            }
        }))

        const message1 = await shortPolling(ws1Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(userX);
        expect(message1.payload.y).toBe(userY);
    })
    test("Valid movement info should be broadcasted to all users ",async()=>{
        ws2.send(JSON.stringify({
            "type":"move",
            "payload":{
                "x":adminX+1,
                "y":adminY,
                // "userId":adminId
            }
        }))

        const message1 = await shortPolling(ws1Messages);
        expect(message1.type).toBe("movement");
        expect(message1.payload.x).toBe(adminX+1);
        expect(message1.payload.y).toBe(adminY);
    })
    test("User left broadcast to other users ",async()=>{
        ws2.close();
        const message1 = await shortPolling(ws1Messages);
        expect(message1.type).toBe("user-left");
        expect(message1.payload.userId).toBe(userId);
    })
})
