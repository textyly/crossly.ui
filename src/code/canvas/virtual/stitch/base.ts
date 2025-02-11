import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { CanvasConfig, StitchThread } from "../../types.js";
import { DrawStitchThreadsEvent, DrawStitchThreadsListener } from "../types.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase {
    private readonly messaging: IMessaging1<DrawStitchThreadsEvent>;

    constructor(config: CanvasConfig) {
        super(config);
        this.messaging = new Messaging1();
    }

    public onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawThreads(threads: Array<StitchThread>, dotRadius: number): void {
        const drawThreadsEvent = { threads, dotRadius };
        this.messaging.sendToChannel1(drawThreadsEvent);
    }
}