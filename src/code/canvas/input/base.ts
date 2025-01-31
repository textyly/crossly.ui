import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging5 } from "../../messaging/impl.js";
import { IMessaging5 } from "../../messaging/types.js";
import {
    PointerMoveEvent,
    ZoomInListener,
    ZoomOutListener,
    PointerMoveListener,
    ZoomInEvent,
    ZoomOutEvent,
    Position,
    PointerDownListener,
    PointerUpEvent,
    PointerDownEvent,
} from "./types.js";


export abstract class InputCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging5<ZoomInEvent, ZoomOutEvent, PointerMoveEvent, PointerDownEvent, PointerUpEvent>;

    constructor() {
        super();
        this.messaging = new Messaging5();
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

    public onPointerDown(listener: PointerDownListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onPointerUp(listener: PointerDownListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
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

    protected invokePointerMove(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel3(event);
    }

    protected invokePointerDown(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel4(event);
    }

    protected invokePointerUp(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel5(event);
    }
}