import { IThreadPicker } from "../types.js";
import { DialogContentBase } from "./base.js";

export class ThreadPicker extends DialogContentBase implements IThreadPicker {
    
    constructor(container: Element) {
        super(ThreadPicker.name, container);
    }

    protected showContent(): void {
        // append child
        throw new Error("Method not implemented.");
    }

    protected hideContent(): void {
        // remove child
        throw new Error("Method not implemented.");
    }
}