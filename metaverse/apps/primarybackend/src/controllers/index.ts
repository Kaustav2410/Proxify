import { createElement,updateElement,createAvatar,createMap } from "./admin";
import { createSpace,deleteSpace,getSpace,getSpaces,addElementToSpace,deleteElementToSpace } from "./space";
import { signin,signup,getAllAvatars,getAllELements } from "./standalone";
import { metadata,bulkmetadata } from "./user";

export const AdminController = {createElement,updateElement,createAvatar,createMap}
export const SpaceController = {createSpace,deleteSpace,getSpace,getSpaces,addElementToSpace,deleteElementToSpace}
export const StandAloneController = {signin,signup,getAllAvatars,getAllELements}
export const UserController = {metadata,bulkmetadata}
