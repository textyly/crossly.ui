import { Base } from "../general/base.js";
import { IThreadPicker } from "./types.js";

export class ThreadPicker extends Base implements IThreadPicker {
    constructor(container: Element) {
        super(ThreadPicker.name);
    }

    public show(): void {
        throw new Error("Method not implemented.");
    }

    public hide(): void {
        throw new Error("Method not implemented.");
    }
}