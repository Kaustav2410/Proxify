import express from "express"
import spaceRouter from "./space";
import adminRouter from "./admin";
import { StandAloneController } from "../../controllers";
import userRouter from "./user";
import { userMiddleware,adminMiddleware } from "../../middlewares";
const router = express.Router();
const app = express();

// user routes
router.get("/",((req:any,res:any)=>{
    res.send("Hello world server is live")   //working
}))
console.log("Inside of index router")
router.get("/elements", StandAloneController.getAllELements);
router.get("/avatars", StandAloneController.getAllAvatars);
router.post("/signin", StandAloneController.signin);
router.post("/signup", StandAloneController.signup);

router.use("/space",userMiddleware.userAuthentication, spaceRouter);
router.use("/admin",adminMiddleware.adminAuthentication ,adminRouter);
router.use("/user",userMiddleware.userAuthentication,userRouter);

export default router;
