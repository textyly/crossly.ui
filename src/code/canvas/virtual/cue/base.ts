import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging7 } from "../../../messaging/impl.js";
import { IMessaging7 } from "../../../messaging/types.js";
import { CueThread, CueDot, CanvasConfig, Id } from "../../types.js";
import {
    ICueCanvas,
    DrawCueDotEvent,
    RemoveCueDotEvent,
    DrawCueDotListener,
    MoveCueThreadEvent,
    DrawCueThreadEvent,
    RemoveCueDotListener,
    RemoveCueThreadEvent,
    DrawCueThreadListener,
    MoveCueThreadListener,
    RemoveCueThreadListener,
} from "../types.js";
import { IInputCanvas } from "../../input/types.js";
import { VirtualCanvas } from "../virtual.js";

export abstract class CueCanvasBase extends VirtualCanvas implements ICueCanvas {
    private readonly messaging: IMessaging7<DrawCueDotEvent, DrawCueDotEvent, DrawCueThreadEvent, RemoveCueDotEvent, MoveCueThreadEvent, DrawCueThreadEvent, RemoveCueThreadEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
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

    protected invokeRemoveDot(dotId: Id): void {
        const drawDotEvent = { dotId };
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

    protected invokeRemoveThread(threadId: Id): void {
        const drawThreadEvent = { threadId };
        this.messaging.sendToChannel7(drawThreadEvent);
    }
}