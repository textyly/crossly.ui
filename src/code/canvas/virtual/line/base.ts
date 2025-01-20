import { CanvasBase } from "../../base.js";
import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { DrawLineEvent, DrawLineListener, Line } from "../types.js";

export abstract class LineVirtualCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging1<DrawLineEvent>;

    constructor() {
        super();
        this.messaging = new Messaging1();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawLine(listener: DrawLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawLine(line: Line): void {
        const drawDotEvent = { line };
        this.messaging.sendToChannel1(drawDotEvent);
    }
}