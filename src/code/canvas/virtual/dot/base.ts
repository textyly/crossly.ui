import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { CanvasBase } from "../../base.js";
import { Dot, DrawDotEvent, DrawDotListener } from "../types.js";

export abstract class DotVirtualCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging1<DrawDotEvent>;

    constructor() {
        super();

        const className = DotVirtualCanvasBase.name;
        this.messaging = new Messaging1(className);
        this.messaging.start();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawDot(listener: DrawDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    public invokeDrawDot(dot: Dot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    public override dispose(): void {
        this.messaging.stop();
        super.dispose();
    }
} 