import { ICloseMenu } from "./types.js";
import { Base } from "../../general/base.js";
import assert from "../../asserts/assert.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class CloseMenu extends Base implements ICloseMenu {
    private messaging: IVoidMessaging;
    private readonly closeButton: Element;

    private closeListener: (event: Event) => void;

    constructor(container: Element) {
        super(CloseMenu.name);

        this.messaging = new VoidMessaging();

        this.closeButton = this.getCloseButton(container);
        this.closeListener = () => { };

        this.subscribe();
    }

    public onClose(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
        super.dispose();
    }

    private getCloseButton(container: Element): Element {
        const closeElement = container.querySelector('#close-back');
        assert.defined(closeElement, "closeElement");
        return closeElement;
    }

    private subscribe(): void {
        this.closeListener = this.handleClose.bind(this);
        this.closeButton.addEventListener("click", this.closeListener);
    }

    private unsubscribe(): void {
        this.closeButton.removeEventListener("click", this.closeListener);
    }

    private handleClose(): void {
        this.invokeClose();
    }

    private invokeClose(): void {
        this.messaging.sendToChannel0();
    }
}