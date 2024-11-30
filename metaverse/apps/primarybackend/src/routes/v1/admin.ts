import express, { Router } from "express"
const app = express();
import { AdminController } from "../../controllers";

const adminRouter = Router();

adminRouter.post("/element", AdminController.createElement);
adminRouter.put("/element/:elementId", AdminController.updateElement);
adminRouter.post("/avatar",AdminController.createAvatar)
adminRouter.post("/map",AdminController.createMap)


export default adminRouter
