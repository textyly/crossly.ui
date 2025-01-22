import { Dot, Line } from "../../types.js";
import { CanvasBase } from "../../base.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { DrawDotEvent, DrawDotListener, DrawLineEvent, DrawLineListener } from "../types.js";

export abstract class StitchCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging2<DrawLineEvent, DrawDotEvent>;

    constructor() {
        super();
        this.messaging = new Messaging2();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawLine(listener: DrawLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDot(listener: DrawDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawLine(line: Line): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel1(drawLineEvent);
    }

    protected invokeDrawDot(dot: Dot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel2(drawDotEvent);
    }
}