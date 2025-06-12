import { VirtualCanvasBase } from "../base.js";
import { FabricPattern } from "../../types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { CanvasConfig } from "../../../config/types.js";
import { Messaging4 } from "../../../messaging/impl.js";
import { IMessaging4 } from "../../../messaging/types.js";
import { IFabricDotArray } from "../../utilities/arrays/types.js";
import { FabricThreadArray } from "../../utilities/arrays/thread/fabric.js";
import {
    IFabricCanvas,
    ChangeFabricEvent,
    DrawFabricDotsEvent,
    ChangeFabricListener,
    DrawFabricDotsListener,
    DrawFabricThreadsEvent,
    DrawFabricThreadsListener,
    DrawFabricBackgroundEvent,
    DrawFabricBackgroundListener,
} from "../types.js";

export abstract class FabricCanvasBase extends VirtualCanvasBase implements IFabricCanvas {
    private readonly messaging: IMessaging4<ChangeFabricEvent, DrawFabricDotsEvent, DrawFabricThreadsEvent, DrawFabricBackgroundEvent>;

    constructor(className: string, config: CanvasConfig, input: IInputCanvas) {
        super(className, config, input);
        this.messaging = new Messaging4();
    }

    public onChange(listener: ChangeFabricListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDots(listener: DrawFabricDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawThreads(listener: DrawFabricThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onDrawBackground(listener:  DrawFabricBackgroundListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public override dispose(): void {
        super.ensureAlive();
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeChange(pattern: FabricPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawDots(dots: IFabricDotArray): void {
        const event = { dots };
        this.messaging.sendToChannel2(event);
    }

    protected invokeDrawThreads(threads: FabricThreadArray): void {
        const event = { threads };
        this.messaging.sendToChannel3(event);
    }

    protected invokeDrawBackground(color: string): void {
        const event = { color };
        this.messaging.sendToChannel4(event);
    }
} 