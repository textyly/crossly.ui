import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { IDialogContent } from "../types.js";
import { Listener, VoidListener } from "../../types.js";

export abstract class DialogContentBase extends Base implements IDialogContent {
    protected dialogOverlay: HTMLElement;
    protected dialog: HTMLElement;
    protected dialogCloseButton: HTMLElement;

    private dialogOverlayListener: Listener<Event>;
    private dialogCloseButtonListener: VoidListener;

    constructor(className: string, dialogOverlay: HTMLElement) {
        super(className);

        this.dialogOverlay = dialogOverlay;
        this.dialog = this.getDialog(this.dialogOverlay);
        this.dialogCloseButton = this.getDialogCloseButton(this.dialog);


        this.dialogOverlayListener = () => { };
        this.dialogCloseButtonListener = () => { };;

        this.subscribe();
    }

    public show(): void {
        this.showDialog();
        this.showContent();
    }

    public hide(): void {
        this.hideDialog();
        this.hideContent();
    }

    public override dispose(): void {
        this.unsubscribe();
        super.dispose();
    }

    protected abstract showContent(): void;
    protected abstract hideContent(): void;

    private showDialog(): void {
        this.dialogOverlay.style.display = "flex";
        this.dialog.style.display = "flex";
    }

    private hideDialog(): void {
        this.dialogOverlay.style.display = "none";
        this.dialog.style.display = "none";
    }

    private getDialog(container: HTMLElement): HTMLElement {
        const dialogElement = container.querySelector("#modal-dialog") as HTMLElement;
        assert.defined(dialogElement, "dialogElement");
        return dialogElement;
    }

    private getDialogCloseButton(dialog: HTMLElement): HTMLElement {
        const dialogCloseElement = dialog.querySelector("#close-dialog") as HTMLElement;
        assert.defined(dialogCloseElement, "dialogCloseElement");
        return dialogCloseElement;
    }

    private handleDialogOverlayClick(e: Event): void {
        if (e.target === this.dialogOverlay) {
            this.hide();
        }
    }

    private handleDialogClose(): void {
        this.hide();
    }

    private subscribe(): void {
        this.dialogOverlayListener = this.handleDialogOverlayClick.bind(this);
        this.dialogOverlay.addEventListener("click", this.dialogOverlayListener);

        this.dialogCloseButtonListener = this.handleDialogClose.bind(this);
        this.dialog.addEventListener("click", this.dialogCloseButtonListener);
    }

    private unsubscribe(): void {
        this.dialogOverlay.removeEventListener("click", this.dialogOverlayListener);
        this.dialog.removeEventListener("click", this.dialogCloseButtonListener);
    }
}