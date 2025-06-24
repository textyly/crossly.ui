import { IUndoComponent } from "./types.js";
import { Base } from "../../general/base.js";
import assert from "../../asserts/assert.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";

export class UndoComponent extends Base implements IUndoComponent {
    private messaging: IMessaging1<VoidEvent>;

    private readonly container: Element;
    private readonly undoButton: Element;
    private readonly redoButton: Element;

    private undoListener: (event: Event) => void;
    private redoListener: (event: Event) => void;

    constructor(container: Element) {
        super(UndoComponent.name);

        this.container = container;
        this.messaging = new Messaging1();

        const undoElement = container.querySelector('#undo');
        assert.defined(undoElement, "undoElement");
        this.undoButton = undoElement;

        const redoElement = container.querySelector('#redo');
        assert.defined(redoElement, "redoElement");
        this.redoButton = redoElement;

        this.undoListener = () => { };
        this.redoListener = () => { };

        this.subscribe();
    }

    public onUndo(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onRedo(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
        super.dispose();
    }

    private subscribe(): void {
        this.undoListener = this.handleUndo.bind(this);
        this.undoButton.addEventListener("click", this.undoListener);

        this.redoListener = this.handleRedo.bind(this);
        this.redoButton.addEventListener("click", this.redoListener);
    }

    private unsubscribe(): void {
        this.undoButton.removeEventListener("click", this.undoListener);
        this.redoButton.removeEventListener("click", this.redoListener);
    }

    private handleUndo(): void {
        this.invokeUndo();
    }

    private handleRedo(): void {
        this.invokeRedo();
    }

    private invokeUndo(): void {
        this.messaging.sendToChannel0();
    }

    private invokeRedo(): void {
        const event = {};
        this.messaging.sendToChannel1(event);
    }
}