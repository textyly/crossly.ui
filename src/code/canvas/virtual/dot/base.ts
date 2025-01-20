import { CanvasBase } from "../../base.js";
import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { Dot, DrawDotEvent, DrawDotListener } from "../types.js";

export abstract class DotVirtualCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging1<DrawDotEvent>;

    constructor() {
        super();
        this.messaging = new Messaging1();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawDot(listener: DrawDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawDot(dot: Dot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel1(drawDotEvent);
    }
} 