import { CanvasBase } from "../base.js";
import { Messaging8 } from "../../messaging/impl.js";
import { IMessaging8 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    MoveEvent,
    ZoomInEvent,
    IInputCanvas,
    ZoomOutEvent,
    MoveListener,
    MoveStopEvent,
    MoveStartEvent,
    PointerUpEvent,
    ZoomInListener,
    ZoomOutListener,
    MoveStopListener,
    PointerMoveEvent,
    MoveStartListener,
    PointerMoveListener,
    PointerDownListener,
} from "./types.js";


export abstract class InputCanvasBase extends CanvasBase implements IInputCanvas {
    private readonly messaging: IMessaging8<ZoomInEvent, ZoomOutEvent, PointerMoveEvent, PointerUpEvent, MoveStartEvent, MoveEvent, MoveStopEvent, VoidEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging8();
    }

    public onUndo(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onRedo(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel8(listener);
    }

    public onZoomIn(listener: ZoomInListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onZoomOut(listener: ZoomOutListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onPointerMove(listener: PointerMoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onPointerUp(listener: PointerDownListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onMoveStart(listener: MoveStartListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onMove(listener: MoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    public onMoveStop(listener: MoveStopListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel7(listener);
    }

    public override dispose(): void {
        super.ensureAlive();
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeUndo(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeRedo(): void {
        this.messaging.sendToChannel8({});
    }

    protected invokeZoomIn(event: ZoomInEvent): void {
        this.messaging.sendToChannel1(event);
    }

    protected invokeZoomOut(event: ZoomOutEvent): void {
        this.messaging.sendToChannel2(event);
    }

    protected invokePointerMove(event: PointerMoveEvent): void {
        this.messaging.sendToChannel3(event);
    }

    protected invokePointerUp(event: PointerUpEvent): void {
        this.messaging.sendToChannel4(event);
    }

    protected invokeMoveStart(event: MoveStartEvent): void {
        this.messaging.sendToChannel5(event);
    }

    protected invokeMove(event: MoveEvent): void {
        this.messaging.sendToChannel6(event);
    }

    protected invokeMoveStop(event: MoveStopEvent): void {
        this.messaging.sendToChannel7(event);
    }
}