import { DialogContentBase } from "./base.js";
import { IThreadPickerContent } from "../types.js";

export class ThreadPickerContent extends DialogContentBase implements IThreadPickerContent {
    private threadPickerContent: Element;

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(ThreadPickerContent.name, document, dialogOverlay);

        this.threadPickerContent = this.getContent(dialogOverlay, "thread-picker-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.threadPickerContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.threadPickerContent);
    }
}