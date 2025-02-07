import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging7 } from "../../../messaging/impl.js";
import { IMessaging7 } from "../../../messaging/types.js";
import { CueThread, CueDot, CueCanvasConfig } from "../../types.js";
import {
    DrawCueThreadEvent,
    DrawCueThreadListener,
    DrawCueDotEvent,
    DrawCueDotListener,
    RemoveCueDotEvent,
    MoveCueThreadEvent,
    RemoveCueDotListener,
    MoveCueThreadListener,
    RemoveCueThreadEvent,
    RemoveCueThreadListener,
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging7<DrawCueDotEvent, DrawCueDotEvent, DrawCueThreadEvent, RemoveCueDotEvent, MoveCueThreadEvent, DrawCueThreadEvent, RemoveCueThreadEvent>;

    constructor(config: CueCanvasConfig) {
        super(config);
        this.messaging = new Messaging7();
    }

    public onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawThread(listener: DrawCueThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onMoveThread(listener: MoveCueThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onDrawDashThread(listener: DrawCueThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    public onRemoveThread(listener: RemoveCueThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel7(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawDot(dot: CueDot, dotRadius: number, dotColor: string): void {
        const drawDotEvent = { dot, dotRadius, dotColor };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawDashDot(dot: CueDot, dotRadius: number, dotColor: string): void {
        const drawDotEvent = { dot, dotRadius, dotColor };
        this.messaging.sendToChannel2(drawDotEvent);
    }

    protected invokeDrawThread(thread: CueThread): void {
        const drawThreadEvent = { thread };
        this.messaging.sendToChannel3(drawThreadEvent);
    }

    protected invokeRemoveDot(dot: CueDot): void {
        const drawDotEvent = { dot };
        this.messaging.sendToChannel4(drawDotEvent);
    }

    protected invokeMoveThread(thread: CueThread): void {
        const drawThreadEvent = { thread };
        this.messaging.sendToChannel5(drawThreadEvent);
    }

    protected invokeDrawDashThread(thread: CueThread): void {
        const drawThreadEvent = { thread };
        this.messaging.sendToChannel6(drawThreadEvent);
    }

    protected invokeRemoveThread(thread: CueThread): void {
        const drawThreadEvent = { thread };
        this.messaging.sendToChannel7(drawThreadEvent);
    }
}