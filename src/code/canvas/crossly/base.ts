import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { CrosslyCanvasConfig } from "../../config/types.js";
import { ICrosslyCanvas, StitchPattern } from "../types.js";
import {
    Fabric,
    ChangeFabricEvent,
    ChangeFabricListener,
    ChangeStitchPatternEvent,
    ChangeStitchPatternListener,
} from "../virtual/types.js";

export abstract class CrosslyCanvasBase extends CanvasBase implements ICrosslyCanvas {
    private readonly messaging: IMessaging2<ChangeFabricEvent, ChangeStitchPatternEvent>;

    private readonly configuration: CrosslyCanvasConfig;

    constructor(className: string, config: CrosslyCanvasConfig) {
        super(className);
        this.configuration = config;
        this.messaging = new Messaging2();
    }

    public get config(): Readonly<CrosslyCanvasConfig> {
        return this.configuration;
    }

    public onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public abstract draw(): void;

    protected invokeChangeFabric(fabric: Fabric): void {
        const event = { fabric };
        this.messaging.sendToChannel1(event);
    }

    protected invokeChangeStitchPattern(pattern: StitchPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel2(event);
    }
}