import { CanvasBase } from "../base.js";
import { Messaging4 } from "../../messaging/impl.js";
import { IMessaging4 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";
import { FabricPattern, StitchPattern, ICrosslyCanvas } from "../types.js";
import { ChangeFabricEvent, ChangeFabricListener, ChangeStitchPatternEvent, ChangeStitchPatternListener } from "../virtual/types.js";

export abstract class CrosslyCanvasBase extends CanvasBase implements ICrosslyCanvas {
    private readonly messaging: IMessaging4<ChangeFabricEvent, ChangeStitchPatternEvent, VoidEvent, VoidEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging4();
    }

    public onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onZoomIn(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onZoomOut(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    protected invokeChangeFabric(pattern: FabricPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeChangeStitchPattern(pattern: StitchPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel2(event);
    }

    protected invokeZoomIn(): void {
        const event: VoidEvent = {};
        this.messaging.sendToChannel3(event);
    }

    protected invokeZoomOut(): void {
        const event: VoidEvent = {};
        this.messaging.sendToChannel4(event);
    }
}