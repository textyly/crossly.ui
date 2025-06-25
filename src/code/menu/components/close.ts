import { Base } from "../../general/base.js";
import { ICloseComponent } from "./types.js";
import assert from "../../asserts/assert.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class CloseComponent extends Base implements ICloseComponent {
    private messaging: IVoidMessaging;

    private readonly container: Element;
    private readonly closeButton: Element;

    private closeListener: (event: Event) => void;

    constructor(container: Element) {
        super(CloseComponent.name);

        this.container = container;
        this.messaging = new VoidMessaging();

        const closeElement = container.querySelector('#close-back');
        assert.defined(closeElement, "closeElement");
        this.closeButton = closeElement;

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