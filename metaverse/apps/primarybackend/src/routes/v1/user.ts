import express, { Router } from "express"
const app = express();
import { UserController } from "../../controllers";

const userRouter = Router();
console.log("inside of user router ")
userRouter.post("/metadata", UserController.metadata);
// https://www.geeksforgeeks.org/difference-between-req-query-and-req-params-in-express/?ref=asr1
userRouter.get("/metadata/bulk/",UserController.bulkmetadata)


export default userRouter
