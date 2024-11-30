import { userAuthentication } from "./user";
import { adminAuthentication } from "./admin";

export const userMiddleware = {userAuthentication}
export const adminMiddleware = {adminAuthentication}
