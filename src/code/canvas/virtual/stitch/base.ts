import { CanvasBase } from "../../base.js";
import { StitchDot, StitchLine } from "../../types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { DrawStitchDotEvent, DrawStitchDotListener, DrawStitchLineEvent, DrawStitchLineListener } from "../types.js";

export abstract class StitchCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging4<DrawStitchDotEvent, DrawStitchDotEvent, DrawStitchLineEvent, DrawStitchLineEvent>;

    constructor() {
        super();
        this.messaging = new Messaging4();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawFrontDot(listener: DrawStitchDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawBackDot(listener: DrawStitchDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawFrontLine(listener: DrawStitchLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onDrawBackLine(listener: DrawStitchLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawFrontDot(dot: StitchDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawBackDot(dot: StitchDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel2(drawDotEvent);
    }

    protected invokeDrawFrontLine(line: StitchLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel3(drawLineEvent);
    }

    protected invokeDrawBackLine(line: StitchLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel4(drawLineEvent);
    }
}