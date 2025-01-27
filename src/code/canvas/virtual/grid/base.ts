import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import { GridCanvasConfig, GridDot, GridThread } from "../../types.js";
import { DrawGridDotsEvent, DrawGridDotsListener, DrawGridThreadsEvent, DrawGridThreadsListener } from "../types.js";

export abstract class GridCanvasBase extends VirtualCanvasBase<GridCanvasConfig> {
    private readonly messaging: IMessaging4<DrawGridDotsEvent, DrawGridDotsEvent, DrawGridThreadsEvent, DrawGridThreadsEvent>;

    constructor(config: GridCanvasConfig) {
        super(config);
        this.messaging = new Messaging4();
    }

    public onDrawVisibleDots(listener: DrawGridDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawInvisibleDots(listener: DrawGridDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawVisibleThreads(listener: DrawGridThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onDrawInvisibleThreads(listener: DrawGridThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawVisibleDots(dots: Array<GridDot>): void {
        const drawDotEvent = { dots };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawInvisibleDots(dots: Array<GridDot>): void {
        const drawDotEvent = { dots };
        this.messaging.sendToChannel2(drawDotEvent);
    }

    protected invokeDrawVisibleThreads(threads: Array<GridThread>): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel3(drawThreadsEvent);
    }

    protected invokeDrawInvisibleThreads(threads: Array<GridThread>): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel4(drawThreadsEvent);
    }
} 