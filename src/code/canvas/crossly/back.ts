import { IBackSideView } from "../types.js";

export class BackSideView implements IBackSideView {
    private readonly backSideContainer: HTMLElement;

    constructor(backSideContainer: HTMLElement) {
        this.backSideContainer = backSideContainer;
    }

    public show(): void {
        this.backSideContainer.style.display = "flex";
    }

    public hide(): void {
        this.backSideContainer.style.display = "none";
    }
}