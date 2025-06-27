import { IUserContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class UserContent extends DialogContentBase implements IUserContent {
    private userContent: Element;

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(UserContent.name, document, dialogOverlay);

        this.userContent = this.getContent(dialogOverlay, "user-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.userContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.userContent);
    }
}