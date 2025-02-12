import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { CanvasConfig, GridThread } from "../../types.js";
import {
    IGridCanvas,
    DrawGridDotsEvent,
    DrawGridDotsListener,
    DrawGridThreadsEvent,
    DrawGridThreadsListener,
} from "../types.js";

export abstract class GridCanvasBase extends VirtualCanvasBase implements IGridCanvas {
    private readonly messaging: IMessaging2<DrawGridDotsEvent, DrawGridThreadsEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging2();
    }

    public onDrawDots(listener: DrawGridDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawThreads(listener: DrawGridThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawDots(dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string): void {
        const drawDotEvent = { dotsX, dotsY, dotRadius, dotColor };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawThreads(threads: Array<GridThread>): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel2(drawThreadsEvent);
    }
} 