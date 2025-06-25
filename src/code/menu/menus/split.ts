import assert from "../../asserts/assert.js";
import { Base } from "../../general/base.js";
import { ISplitViewMenu } from "./types.js";
import { VoidMessaging } from "../../messaging/impl.js";
import { IVoidMessaging } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";

export class SplitViewMenu extends Base implements ISplitViewMenu {
    private readonly messaging: IVoidMessaging;

    private readonly splitButton: Element;
    private splitListener: (event: Event) => void;

    constructor(container: Element) {
        super(SplitViewMenu.name);

        this.messaging = new VoidMessaging();

        const splitElement = container.querySelector('#toggle-split-view');
        assert.defined(splitElement, "splitElement");
        this.splitButton = splitElement;
        this.splitListener = () => { };

        this.subscribe();
    }

    public onToggleSplitView(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public override dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
        super.dispose();
    }

    private subscribe(): void {
        this.splitListener = this.handleSplit.bind(this);
        this.splitButton.addEventListener("click", this.splitListener);
    }

    private unsubscribe(): void {
        this.splitButton.removeEventListener("click", this.splitListener);
    }

    private handleSplit(): void {
        this.invokeSplit();
    }

    private invokeSplit(): void {
        this.messaging.sendToChannel0();
    }
}