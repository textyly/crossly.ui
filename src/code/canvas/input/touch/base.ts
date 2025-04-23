import { CanvasBase } from "../../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { Position, ZoomInEvent, ZoomInListener, ZoomOutEvent, ZoomOutListener } from "../types.js";

export abstract class TouchInputBase extends CanvasBase {
    private readonly messaging: IMessaging2<ZoomInEvent, ZoomOutEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging2();
    }

    public onZoomIn(listener: ZoomInListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onZoomOut(listener: ZoomOutListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        super.ensureAlive();
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeZoomIn(currentPosition: Position): void {
        const event = { currentPosition };
        this.messaging.sendToChannel1(event);
    }

    protected invokeZoomOut(currentPosition: Position): void {
        const event = { currentPosition };
        this.messaging.sendToChannel2(event);
    }
}