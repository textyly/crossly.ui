import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import {
    IStitchCanvas,
    DrawStitchDotsEvent,
    DrawStitchDotsListener,
    DrawStitchThreadsEvent,
    DrawStitchThreadsListener,
} from "../types.js";
import { VirtualCanvasBase } from "../virtual.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { StitchThreadArray } from "../../utilities/arrays/thread/stitch.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase implements IStitchCanvas {
    private readonly messaging: IMessaging2<DrawStitchThreadsEvent, DrawStitchDotsEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging2();
    }

    public onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDots(listener: DrawStitchDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawThreads(threads: StitchThreadArray): void {
        const event = { threads };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawDots(dots: DotArray): void {
        const event = { dots };
        this.messaging.sendToChannel2(event);
    }
}