import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging4 } from "../../messaging/impl.js";
import { IMessaging4 } from "../../messaging/types.js";
import {
    IInputCanvas,
    MouseLeftButtonDownEvent,
    MouseMoveEvent,
    ZoomInListener,
    ZoomOutListener,
    MouseMoveListener,
    MouseLeftButtonDownListener,
    ZoomInEvent,
    ZoomOutEvent,
    Position
} from "./types.js";


export abstract class InputCanvasBase extends CanvasBase implements IInputCanvas {
    private readonly messaging: IMessaging4<ZoomInEvent, ZoomOutEvent, MouseMoveEvent, MouseLeftButtonDownEvent>;

    constructor() {
        super();
        this.messaging = new Messaging4();
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
}