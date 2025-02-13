import { VirtualCanvasBase } from "../base.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { CanvasConfig, StitchThread } from "../../types.js";
import { DrawStitchThreadsEvent, DrawStitchThreadsListener, IStitchCanvas } from "../types.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase implements IStitchCanvas {
    private readonly messaging: IMessaging1<DrawStitchThreadsEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging1();
    }

    public onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawThreads(threads: Array<StitchThread>): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel1(drawThreadsEvent);
    }
}