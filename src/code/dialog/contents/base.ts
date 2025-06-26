import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { IDialogContent } from "../types.js";

export abstract class DialogContentBase extends Base implements IDialogContent {
    protected dialog: Element;

    constructor(className: string, container: Element) {
        super(className);

        this.dialog = this.getDialog(container);
    }

    public show(): void {
        const modalOverlay = document.querySelector("#modal-overlay") as HTMLElement;
        const modalDialog = document.querySelector("#modal-dialog") as HTMLElement;

        assert.defined(modalOverlay, "modalOverlay");
        assert.defined(modalDialog, "modalDialog");

        modalOverlay.style.display = "flex";
        modalDialog.style.display = "flex";

        modalOverlay.addEventListener("click", (e) => {
            // Only close if the user clicks outside the modal dialog
            if (e.target === modalOverlay) {
                modalOverlay.style.display = "none";
                modalDialog.style.display = "none";
            }
        });


    }

    public hide(): void {
        throw new Error("Method not implemented.");
    }

    protected abstract showContent(): void;
    protected abstract hideContent(): void;

    private getDialog(container: Element): Element {
        const dialogElement = container.querySelector('#modal-dialog');
        assert.defined(dialogElement, "dialogElement");
        return dialogElement;
    }
}