import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { IDialogs, IThreadPicker } from "./types.js";
import { ThreadPicker } from "./contents/picker.js";

export class Dialogs extends Base implements IDialogs {
    private readonly threadPicker: IThreadPicker;
    
    constructor(document: Document) {
        super(Dialogs.name);

        const dialogOverlay = this.getDialogOverlay(document);
        this.threadPicker = new ThreadPicker(dialogOverlay);
    }

    public get picker(): IThreadPicker {
        return this.threadPicker;
    }

    private getDialogOverlay(document: Document): Element {
        const dialogOverlayElement = document.querySelector('#modal-overlay');
        assert.defined(dialogOverlayElement, "dialogOverlayElement");
        return dialogOverlayElement;
    } 
}