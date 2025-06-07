import { CanvasBase } from "../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging2 } from "../../messaging/impl.js";
import { IMessaging2 } from "../../messaging/types.js";
import { FabricPattern, StitchPattern, ICrosslyCanvas } from "../types.js";
import { ChangeFabricEvent, ChangeFabricListener, ChangeStitchPatternEvent, ChangeStitchPatternListener } from "../virtual/types.js";

export abstract class CrosslyCanvasBase extends CanvasBase implements ICrosslyCanvas {
    private readonly messaging: IMessaging2<ChangeFabricEvent, ChangeStitchPatternEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging2();
    }

    public onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    protected invokeChangeFabric(pattern: FabricPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeChangeStitchPattern(pattern: StitchPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel2(event);
    }
}