import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { CanvasConfig } from "../../../config/types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { DotArray } from "../../utilities/arrays/dot/dot.js";
import { ThreadArray } from "../../utilities/arrays/thread/array.js";
import {
    IFabricCanvas,
    DrawFabricDotsEvent,
    DrawFabricDotsListener,
    DrawFabricThreadsEvent,
    DrawFabricThreadsListener,
} from "../types.js";

export abstract class FabricCanvasBase extends VirtualCanvasBase implements IFabricCanvas {
    private readonly messaging: IMessaging2<DrawFabricDotsEvent, DrawFabricThreadsEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging2();
    }

    public onDrawDots(listener: DrawFabricDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawThreads(listener: DrawFabricThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawDots(dots: DotArray): void {
        const drawDotEvent = { dots };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawThreads(threads: ThreadArray): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel2(drawThreadsEvent);
    }
} 