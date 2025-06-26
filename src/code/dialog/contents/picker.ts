import { IThreadPicker } from "../types.js";
import assert from "../../asserts/assert.js";
import { DialogContentBase } from "./base.js";

export class ThreadPicker extends DialogContentBase implements IThreadPicker {
    private threadPickerContent: Element;

    constructor(container: HTMLElement) {
        super(ThreadPicker.name, container);

        this.threadPickerContent = this.getThreadPickerContent(container);
    }

    protected override showContent(): void {
        this.dialog.appendChild(this.threadPickerContent);
    }

    protected override hideContent(): void {
        this.dialog.removeChild(this.threadPickerContent);
    }

    private getThreadPickerContent(container: Element): Element {
        const hiddenContents = container.querySelector("#hidden-dialog-contents");
        assert.defined(hiddenContents, "hiddenContents");

        const threadPickerContent = container.querySelector("#thread-picker-content");
        assert.defined(threadPickerContent, "threadPickerContent");

        const cloned = threadPickerContent.cloneNode(true) as HTMLElement;
        cloned.style.display = "block";

        hiddenContents.removeChild(threadPickerContent);

        return cloned;
    }
}