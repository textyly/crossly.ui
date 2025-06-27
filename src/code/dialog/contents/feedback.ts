import { DialogContentBase } from "./base.js";
import { IFeedbackContent } from "../types.js";

export class FeedbackContent extends DialogContentBase implements IFeedbackContent {
    private feedbackContent: Element;

    constructor(document: Document, container: HTMLElement) {
        super(FeedbackContent.name, document, container);

        this.feedbackContent = this.getContent(container, "feedback-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.feedbackContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.feedbackContent);
    }
}