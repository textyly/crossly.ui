import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { CueCanvasConfig, StitchCanvasConfig, StitchThread } from "../../types.js";
import { DrawStitchThreadsEvent, DrawStitchThreadsListener } from "../types.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase<CueCanvasConfig> {
    private readonly messaging: IMessaging2<DrawStitchThreadsEvent, DrawStitchThreadsEvent>;

    constructor(config: StitchCanvasConfig) {
        super(config);
        this.messaging = new Messaging2();
    }

    public onDrawFrontThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawBackThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawFrontThreads(threads: Array<StitchThread>, dotRadius: number): void {
        const drawThreadsEvent = { threads, dotRadius };
        this.messaging.sendToChannel1(drawThreadsEvent);
    }

    protected invokeDrawBackThreads(threads: Array<StitchThread>, dotRadius: number): void {
        const drawThreadsEvent = { threads, dotRadius};
        this.messaging.sendToChannel2(drawThreadsEvent);
    }
}