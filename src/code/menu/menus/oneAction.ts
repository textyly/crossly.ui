import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { IDisposable, VoidListener, VoidUnsubscribe } from "../../types.js";

export abstract class OneActionMenu extends Base implements IDisposable {
    private readonly messaging: IVoidMessaging;

    private readonly actionId: string;
    private readonly button: Element;

    private buttonListener: (event: Event) => void;

    constructor(className: string, container: Element, actionId: string) {
        super(className);

        this.messaging = new VoidMessaging();

        this.actionId = actionId;
        this.button = this.getButton(container);
        this.buttonListener = () => { };

        this.subscribe();
    }

    public onAction(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
        super.dispose();
    }

    private getButton(container: Element): Element {
        const actionElement = container.querySelector(`#${this.actionId}`);
        assert.defined(actionElement, "actionElement");
        return actionElement;
    }

    private subscribe(): void {
        this.buttonListener = this.handleButtonClick.bind(this);
        this.button.addEventListener("click", this.buttonListener);
    }

    private unsubscribe(): void {
        this.button.removeEventListener("click", this.buttonListener);
    }

    private handleButtonClick(): void {
        this.invokeAction();
    }

    private invokeAction(): void {
        this.messaging.sendToChannel0();
    }
}