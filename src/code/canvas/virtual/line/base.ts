import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { CanvasBase } from "../../base.js";
import { DrawLineEvent, DrawLineListener, Line } from "../types.js";

export abstract class LineVirtualCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging1<DrawLineEvent>;

    constructor() {
        super();

        const className = LineVirtualCanvasBase.name;
        this.messaging = new Messaging1(className);
        this.messaging.start();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawLine(listener: DrawLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    public invokeDrawLine(line: Line): void {
        const drawDotEvent = { line };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    public override dispose(): void {
        this.messaging.stop();
        super.dispose();
    }
}