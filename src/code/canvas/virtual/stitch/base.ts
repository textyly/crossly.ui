import { VirtualCanvasBase } from "../base.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { CanvasConfig } from "../../../config/types.js";
import { IMessaging2 } from "../../../messaging/types.js";
import { StitchPattern, StitchSegment } from "../../types.js";
import {
    Density,
    IStitchCanvas,
    DrawStitchPatternEvent,
    DrawStitchSegmentEvent,
    DrawStitchPatternListener,
    DrawStitchSegmentListener
} from "../types.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase implements IStitchCanvas {
    private readonly messaging: IMessaging2<DrawStitchSegmentEvent, DrawStitchPatternEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging2();
    }

    public onDrawSegment(listener: DrawStitchSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawPattern(listener: DrawStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawSegment(segment: StitchSegment, density: Density): void {
        const event = { segment, density };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawPattern(pattern: StitchPattern, density: Density): void {
        const event = { pattern, density };
        this.messaging.sendToChannel2(event);
    }
}