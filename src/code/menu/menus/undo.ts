import { IUndoMenu } from "./types.js";
import { Base } from "../../general/base.js";
import html from "../../utilities.ts/html.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";

export class UndoMenu extends Base implements IUndoMenu {
    private messaging: IMessaging1<VoidEvent>;

    private readonly undoId = "undo";
    private readonly redoId = "redo";

    private readonly undoButton: Element;
    private readonly redoButton: Element;

    private undoListener: (event: Event) => void;
    private redoListener: (event: Event) => void;

    constructor(container: Element) {
        super(UndoMenu.name);

        this.messaging = new Messaging1();

        this.undoButton = html.getById(container, this.undoId);
        this.redoButton = html.getById(container, this.redoId);

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
        super.ensureAlive();
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