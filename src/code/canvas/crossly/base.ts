import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging3 } from "../../messaging/impl.js";
import { IMessaging3 } from "../../messaging/types.js";
import {
    FabricPattern,
    StitchPattern,
    ICrosslyCanvas,
    ChangeNameEvent,
    ChangeNameListener,
} from "../types.js";
import {
    ChangeFabricEvent,
    ChangeFabricListener,
    ChangeStitchPatternEvent,
    ChangeStitchPatternListener,
} from "../virtual/types.js";

export abstract class CrosslyCanvasBase extends CanvasBase implements ICrosslyCanvas {
    private readonly messaging: IMessaging3<ChangeFabricEvent, ChangeStitchPatternEvent, ChangeNameEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging3();
    }

    public onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onChangeName(listener: ChangeNameListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    protected invokeChangeFabric(pattern: FabricPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeChangeStitchPattern(pattern: StitchPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel2(event);
    }

    protected invokeChangeName(name: string): void {
        const event = { name };
        this.messaging.sendToChannel3(event);
    }
}