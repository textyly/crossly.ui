import { VirtualCanvasBase } from "../base.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { CanvasConfig } from "../../../config/types.js";
import { Messaging3 } from "../../../messaging/impl.js";
import { IMessaging3 } from "../../../messaging/types.js";
import { StitchPattern, StitchSegment } from "../../types.js";
import {
    Density,
    IStitchCanvas,
    DrawStitchPatternEvent,
    DrawStitchSegmentEvent,
    ChangeStitchPatternEvent,
    DrawStitchPatternListener,
    DrawStitchSegmentListener,
    ChangeStitchPatternListener,
} from "../types.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase implements IStitchCanvas {
    private readonly messaging: IMessaging3<ChangeStitchPatternEvent, DrawStitchSegmentEvent, DrawStitchPatternEvent>;

    constructor(className: string, config: CanvasConfig, input: IInputCanvas) {
        super(className, config, input);
        this.messaging = new Messaging3();
    }

    public onChange(listener: ChangeStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawSegment(listener: DrawStitchSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawPattern(listener: DrawStitchPatternListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeChange(pattern: StitchPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawSegment(segment: StitchSegment, density: Density): void {
        const event = { segment, density };
        this.messaging.sendToChannel2(event);
    }

    protected invokeDrawPattern(pattern: StitchPattern, density: Density): void {
        const event = { pattern, density };
        this.messaging.sendToChannel3(event);
    }
}