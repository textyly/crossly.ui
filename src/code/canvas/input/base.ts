import { CanvasBase } from "../base.js";
import { Messaging6 } from "../../messaging/impl.js";
import { IMessaging6 } from "../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../types.js";
import {
    Position,
    MoveEvent,
    ZoomInEvent,
    IInputCanvas,
    ZoomOutEvent,
    MoveListener,
    PointerUpEvent,
    ZoomInListener,
    ZoomOutListener,
    PointerMoveEvent,
    PointerMoveListener,
    PointerDownListener,
} from "./types.js";


export abstract class InputCanvasBase extends CanvasBase implements IInputCanvas {
    private readonly messaging: IMessaging6<ZoomInEvent, ZoomOutEvent, PointerMoveEvent, PointerUpEvent, MoveEvent, void>;

    constructor() {
        super();
        this.messaging = new Messaging6();
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

    public onMoveStart(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onMove(listener: MoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onMoveStop(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeZoomIn(): void {
        this.messaging.sendToChannel1({});
    }

    protected invokeZoomOut(): void {
        this.messaging.sendToChannel2({});
    }

    protected invokePointerMove(event: PointerMoveEvent): void {
        this.messaging.sendToChannel3(event);
    }

    protected invokePointerUp(event: PointerUpEvent): void {
        this.messaging.sendToChannel4(event);
    }

    protected invokeMoveStart(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeMove(event: MoveEvent): void {
        this.messaging.sendToChannel5(event);
    }

    protected invokeMoveStop(): void {
        this.messaging.sendToChannel6();
    }
}