import { IHomeContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class HomeContent extends DialogContentBase implements IHomeContent {

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(HomeContent.name, document, dialogOverlay, "home-content");
    }
}