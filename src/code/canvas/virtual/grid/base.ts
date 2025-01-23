import { CanvasBase } from "../../base.js";
import { GridDot, GridLine } from "../../types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import { VoidListener, VoidUnsubscribe } from "../../../types.js";
import { DrawGridDotEvent, DrawGridDotListener, DrawGridLineEvent, DrawGridLineListener } from "../types.js";

export abstract class GridCanvasBase extends CanvasBase {
    private readonly messaging: IMessaging4<DrawGridDotEvent, DrawGridDotEvent, DrawGridLineEvent, DrawGridLineEvent>;

    constructor() {
        super();
        this.messaging = new Messaging4();
    }

    public onRedraw(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onDrawVisibleDot(listener: DrawGridDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawInvisibleDot(listener: DrawGridDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawVisibleLine(listener: DrawGridLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onDrawInvisibleLine(listener: DrawGridLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeRedraw(): void {
        this.messaging.sendToChannel0();
    }

    protected invokeDrawVisibleDot(dot: GridDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawInvisibleDot(dot: GridDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel2(drawDotEvent);
    }

    protected invokeDrawVisibleLine(line: GridLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel3(drawLineEvent);
    }

    protected invokeDrawInvisibleLine(line: GridLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel4(drawLineEvent);
    }
} 