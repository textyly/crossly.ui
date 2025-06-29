import { Base } from "../../general/base.js";
import { IDialogContent } from "../types.js";
import html from "../../utilities.ts/html.js";
import { Visibility } from "../../canvas/types.js";
import { Listener, VoidListener } from "../../types.js";

export abstract class DialogContentBase extends Base implements IDialogContent {
    protected readonly document: Document;
    protected readonly dialogOverlay: HTMLElement;
    protected readonly dialog: HTMLElement;
    protected readonly dialogContent: HTMLElement;
    protected readonly dialogCloseButton: HTMLElement;

    private dialogOverlayListener: Listener<Event>;
    private dialogCloseButtonListener: VoidListener;
    private escapeKeyboardListener: Listener<KeyboardEvent>;

    private visibility: Visibility;

    constructor(className: string, document: Document, dialogOverlay: HTMLElement, dialogContentId: string) {
        super(className);

        this.document = document;
        this.dialogOverlay = dialogOverlay;
        this.dialog = html.getById(this.dialogOverlay, "modal-dialog");
        this.dialogContent = this.getContent(this.dialogOverlay, dialogContentId);
        this.dialogCloseButton = html.getById(this.dialog, "close-dialog");

        this.dialogOverlayListener = () => { };
        this.dialogCloseButtonListener = () => { };
        this.escapeKeyboardListener = () => { };

        this.visibility = Visibility.Hidden;

        this.subscribe();
    }

    public get isVisible(): boolean {
        return this.visibility === Visibility.Visible;
    }

    public show(): void {
        if (!this.isVisible) {
            this.showDialog();
            this.showContent();
            this.visibility = Visibility.Visible;
        }
    }

    public hide(): void {
        if (this.isVisible) {
            this.hideDialog();
            this.hideContent();
            this.visibility = Visibility.Hidden;
        }
    }

    public override dispose(): void {
        this.ensureAlive();
        this.unsubscribe();
        super.dispose();
    }

    protected getContent(container: Element, contentId: string): HTMLElement {
        const hiddenContents = html.getById(container, "hidden-dialog-contents");

        const content = html.getById(container, `${contentId}`);
        const cloned = content.cloneNode(true) as HTMLElement;
        cloned.style.display = "flex";

        hiddenContents.removeChild(content);

        if (hiddenContents.children.length === 0) {
            container.removeChild(hiddenContents);
        }

        return cloned;
    }

    private showContent(): void {
        this.dialog.appendChild(this.dialogContent);
    }

    private hideContent(): void {
        this.dialog.removeChild(this.dialogContent);
    }

    private showDialog(): void {
        this.dialogOverlay.style.display = "flex";
        this.dialog.style.display = "flex";
    }

    private hideDialog(): void {
        this.dialogOverlay.style.display = "none";
        this.dialog.style.display = "none";
    }

    private handleDialogOverlayClick(e: Event): void {
        if (e.target === this.dialogOverlay) {
            this.hide();
        }
    }

    private handleDialogClose(): void {
        this.hide();
    }

    private handleEscape(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            this.hide();
        }
    }

    private subscribe(): void {
        this.dialogOverlayListener = this.handleDialogOverlayClick.bind(this);
        this.dialogOverlay.addEventListener("click", this.dialogOverlayListener);

        this.dialogCloseButtonListener = this.handleDialogClose.bind(this);
        this.dialogCloseButton.addEventListener("click", this.dialogCloseButtonListener);

        this.escapeKeyboardListener = this.handleEscape.bind(this);
        this.document.addEventListener("keydown", this.escapeKeyboardListener);
    }

    private unsubscribe(): void {
        this.dialogOverlay.removeEventListener("click", this.dialogOverlayListener);
        this.dialogCloseButton.removeEventListener("click", this.dialogCloseButtonListener);
        this.document.removeEventListener("keydown", this.escapeKeyboardListener);
    }
}