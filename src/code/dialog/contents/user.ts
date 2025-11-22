import { IUserContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class UserContent extends DialogContentBase implements IUserContent {

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(UserContent.name, document, dialogOverlay, "user-content");
    }

}