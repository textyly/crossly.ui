import { DialogContentBase } from "./base.js";
import { IThreadPickerContent } from "../types.js";

export class ThreadPickerContent extends DialogContentBase implements IThreadPickerContent {
    private threadPickerContent: Element;

    constructor(container: HTMLElement) {
        super(ThreadPickerContent.name, container);

        this.threadPickerContent = this.getContent(container, "thread-picker-content");
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.threadPickerContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.threadPickerContent);
    }
}