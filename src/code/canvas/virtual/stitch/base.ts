import { CanvasConfig } from "../../types.js";
import { VirtualCanvasBase } from "../virtual.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging1 } from "../../../messaging/impl.js";
import { IMessaging1 } from "../../../messaging/types.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";
import { IStitchCanvas, DrawStitchThreadsEvent, DrawStitchThreadsListener } from "../types.js";

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

    protected invokeDrawThreads(threads: StitchThreadArray): void {
        const event = { threads };
        this.messaging.sendToChannel1(event);
    }
}