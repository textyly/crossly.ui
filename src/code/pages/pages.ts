import { IPages } from "./types.js";
import { Base } from "../general/base.js";

export class Pages extends Base implements IPages {
    constructor(){
        super(Pages.name);
    }
}