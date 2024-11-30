import express from "express"
import router from "./routes";
import dotenv from "dotenv"
import path from "path"

// bcrypt doesn't work with esbuild 
// https://github.com/mapbox/node-pre-gyp/issues/661
const app = express();
app.use(express.json());
dotenv.config({path:path.resolve(__dirname,"../../..",".env")});
console.log({path:path.resolve(__dirname,"../../..",".env")})
console.log(process.env.PORT)


const port = process.env.PORT || 5000;
app.use("/api",router);
app.listen(port,()=>{
    console.log(`Server started at port :  ${port} `)
})
