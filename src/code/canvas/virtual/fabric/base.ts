import { VirtualCanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { CanvasConfig, FabricThread } from "../../types.js";
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

    protected invokeDrawDots(dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string): void {
        const drawDotEvent = { dotsX, dotsY, dotRadius, dotColor };
        this.messaging.sendToChannel1(drawDotEvent);
    }

    protected invokeDrawThreads(threads: Array<FabricThread>): void {
        const drawThreadsEvent = { threads };
        this.messaging.sendToChannel2(drawThreadsEvent);
    }
} 