import { VirtualCanvasBase } from "../base.js";
import { CueLine, CueDot } from "../../types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import {
    DrawCueLineEvent,
    DrawCueLineListener,
    HoverCueDotEvent,
    HoverCueDotListener,
    RemoveCueLineEvent,
    RemoveCueLineListener,
    UnhoverCueDotEvent,
    UnhoverCueListener,
    CueCanvasConfig
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging4<HoverCueDotEvent, UnhoverCueDotEvent, DrawCueLineEvent, RemoveCueLineEvent>;

    constructor() {
        super();
        this.messaging = new Messaging4();
    }

    public onHoverDot(listener: HoverCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onUnhoverDot(listener: UnhoverCueListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawLine(listener: DrawCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveLine(listener: RemoveCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeHoverDot(dot: CueDot): void {
        const hoverDotEvent = { dot };
        this.messaging.sendToChannel1(hoverDotEvent);
    }

    protected invokeUnhoverDot(dot: CueDot): void {
        const unhoverDotEvent = { dot };
        this.messaging.sendToChannel2(unhoverDotEvent);
    }

    protected invokeDrawLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel3(drawLineEvent);
    }

    protected invokeRemoveLine(line: CueLine): void {
        const removeLineEvent = { line };
        this.messaging.sendToChannel4(removeLineEvent);
    }
}