import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging5 } from "../../messaging/impl.js";
import { IMessaging5 } from "../../messaging/types.js";
import {
    MouseLeftButtonDownEvent,
    MouseMoveEvent,
    ZoomInListener,
    ZoomOutListener,
    MouseMoveListener,
    MouseLeftButtonDownListener,
    ZoomInEvent,
    ZoomOutEvent,
    Position,
    MouseLeftButtonUpListener,
    MouseLeftButtonUpEvent,
} from "./types.js";


export abstract class InputCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging5<ZoomInEvent, ZoomOutEvent, MouseMoveEvent, MouseLeftButtonDownEvent, MouseLeftButtonUpEvent>;

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

    public onMouseMove(listener: MouseMoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onMouseLeftButtonDown(listener: MouseLeftButtonDownListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onMouseLeftButtonUp(listener: MouseLeftButtonUpListener): VoidUnsubscribe {
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

    protected invokeMouseMove(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel3(event);
    }

    protected invokeMouseLeftButtonDown(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel4(event);
    }

    protected invokeMouseLeftButtonUp(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel5(event);
    }
}