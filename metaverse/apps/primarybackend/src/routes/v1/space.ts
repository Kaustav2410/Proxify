import express, { Router } from "express"
const app = express();
import { SpaceController } from "../../controllers";

const spaceRouter = Router();

spaceRouter.post("/", SpaceController.createSpace);
spaceRouter.delete("/element", SpaceController.deleteElementToSpace);
spaceRouter.delete("/:spaceId", SpaceController.deleteSpace);
spaceRouter.get("/all",SpaceController.getSpaces)
spaceRouter.get("/:spaceId",SpaceController.getSpace)
spaceRouter.post("/element", SpaceController.addElementToSpace);


export default spaceRouter
