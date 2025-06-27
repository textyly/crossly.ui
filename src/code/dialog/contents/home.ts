import { IHomeContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class HomeContent extends DialogContentBase implements IHomeContent {
    private homeContent: Element;

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(HomeContent.name, document, dialogOverlay);

        this.homeContent = this.getContent(dialogOverlay, "home-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.homeContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.homeContent);
    }
}