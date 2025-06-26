import { IFeedbackContent } from "../types.js";
import { DialogContentBase } from "./base.js";

export class FeedbackContent extends DialogContentBase implements IFeedbackContent {
    private feedbackContent: Element;

    constructor(container: HTMLElement) {
        super(FeedbackContent.name, container);

        this.feedbackContent = this.getContent(container, "feedback-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.feedbackContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.feedbackContent);
    }
}