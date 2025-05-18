import { VirtualCanvasBase } from "../base.js";
import { FabricPattern } from "../../types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { CanvasConfig } from "../../../config/types.js";
import { Messaging3 } from "../../../messaging/impl.js";
import { IMessaging3 } from "../../../messaging/types.js";
import { IDotArray } from "../../utilities/arrays/types.js";
import { FabricThreadArray } from "../../utilities/arrays/thread/fabric.js";
import {
    IFabricCanvas,
    ChangeFabricEvent,
    DrawFabricDotsEvent,
    ChangeFabricListener,
    DrawFabricDotsListener,
    DrawFabricThreadsEvent,
    DrawFabricThreadsListener,
} from "../types.js";

export abstract class FabricCanvasBase extends VirtualCanvasBase implements IFabricCanvas {
    private readonly messaging: IMessaging3<ChangeFabricEvent, DrawFabricDotsEvent, DrawFabricThreadsEvent>;

    constructor(className: string, config: CanvasConfig, input: IInputCanvas) {
        super(className, config, input);
        this.messaging = new Messaging3();
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

    public override dispose(): void {
        super.ensureAlive();
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeChange(pattern: FabricPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawDots(dots: IDotArray): void {
        const event = { dots };
        this.messaging.sendToChannel2(event);
    }

    protected invokeDrawThreads(threads: FabricThreadArray): void {
        const event = { threads };
        this.messaging.sendToChannel3(event);
    }
} 