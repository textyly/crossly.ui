import { DialogContentBase } from "./base.js";
import { IFeedbackContent } from "../types.js";

export class FeedbackContent extends DialogContentBase implements IFeedbackContent {

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(FeedbackContent.name, document, dialogOverlay, "feedback-content");
    }
}