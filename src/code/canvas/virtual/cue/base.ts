import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging6 } from "../../../messaging/impl.js";
import { IMessaging6 } from "../../../messaging/types.js";
import { CueLine, CueDot, CueCanvasConfig } from "../../types.js";
import {
    DrawCueLineEvent,
    DrawCueLineListener,
    DrawCueDotEvent,
    DrawCueDotListener,
    RemoveCueDotEvent,
    MoveCueLineEvent,
    RemoveCueDotListener,
    MoveCueLineListener,
    RemoveCueLineEvent,
    RemoveCueLineListener,
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging6<DrawCueDotEvent, DrawCueLineEvent, RemoveCueDotEvent, MoveCueLineEvent, DrawCueLineEvent, RemoveCueLineEvent>;

    constructor(config: CueCanvasConfig) {
        super(config);
        this.messaging = new Messaging6();
    }

    public onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawLine(listener: DrawCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onMoveLine(listener: MoveCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onDrawDashLine(listener: DrawCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onRemoveLine(listener: RemoveCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawDot(dot: CueDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel2(drawLineEvent);
    }

    protected invokeRemoveDot(dot: CueDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel3(drawDotEvent);
    }

    protected invokeMoveLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel4(drawLineEvent);
    }

    protected invokeDrawDashLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel5(drawLineEvent);
    }

    protected invokeRemoveLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel6(drawLineEvent);
    }
}