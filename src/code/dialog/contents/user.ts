import { IUserContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class UserContent extends DialogContentBase implements IUserContent {
    private userContent: Element;

    constructor(container: HTMLElement) {
        super(UserContent.name, container);

        this.userContent = this.getContent(container, "user-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.userContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.userContent);
    }
}