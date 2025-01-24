import { VirtualCanvasBase } from "../base.js";
import { CueLine, CueDot } from "../../types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging6 } from "../../../messaging/impl.js";
import { IMessaging6 } from "../../../messaging/types.js";
import {
    CueCanvasConfig,
    DrawCueLineEvent,
    DrawCueLineListener,
    HoverCueDotEvent,
    HoverCueDotListener,
    RemoveCueLineEvent,
    RemoveCueLineListener,
    UnhoverCueDotEvent,
    UnhoverCueListener
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging6<HoverCueDotEvent, UnhoverCueDotEvent, DrawCueLineEvent, RemoveCueLineEvent, DrawCueLineEvent, RemoveCueLineEvent>;

    constructor(config: CueCanvasConfig) {
        super(config);
        this.messaging = new Messaging6();
    }

    public onHoverDot(listener: HoverCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onUnhoverDot(listener: UnhoverCueListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawFrontLine(listener: DrawCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveFrontLine(listener: RemoveCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onDrawBackLine(listener: DrawCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onRemoveBackLine(listener: RemoveCueLineListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
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

    protected invokeDrawFrontLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel3(drawLineEvent);
    }

    protected invokeRemoveFrontLine(line: CueLine): void {
        const removeLineEvent = { line };
        this.messaging.sendToChannel4(removeLineEvent);
    }

    protected invokeDrawBackLine(line: CueLine): void {
        const drawLineEvent = { line };
        this.messaging.sendToChannel5(drawLineEvent);
    }

    protected invokeRemoveBackLine(line: CueLine): void {
        const removeLineEvent = { line };
        this.messaging.sendToChannel6(removeLineEvent);
    }
}