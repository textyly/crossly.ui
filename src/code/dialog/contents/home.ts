import { IHomeContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class HomeContent extends DialogContentBase implements IHomeContent {
    private homeContent: Element;

    constructor(container: HTMLElement) {
        super(HomeContent.name, container);

        this.homeContent = this.getContent(container, "home-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.homeContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.homeContent);
    }
}