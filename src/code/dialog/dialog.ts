import assert from "../asserts/assert.js";
import { Base } from "../general/base.js";
import { UserContent } from "./contents/user.js";
import { ThreadPickerContent } from "./contents/picker.js";
import { IDialogs, IThreadPickerContent, IUserContent } from "./types.js";

export class Dialogs extends Base implements IDialogs {
    private readonly userContent: IUserContent;
    private readonly threadPickerContent: IThreadPickerContent;

    constructor(document: Document) {
        super(Dialogs.name);

        const dialogOverlay = this.getDialogOverlay(document);

        this.userContent = new UserContent(dialogOverlay);
        this.threadPickerContent = new ThreadPickerContent(dialogOverlay);
    }

    public get user(): IUserContent {
        return this.userContent;
    }

    public get threadPicker(): IThreadPickerContent {
        return this.threadPickerContent;
    }

    private getDialogOverlay(document: Document): HTMLElement {
        const dialogOverlayElement = document.querySelector('#modal-overlay') as HTMLElement;
        assert.defined(dialogOverlayElement, "dialogOverlayElement");
        return dialogOverlayElement;
    }
}