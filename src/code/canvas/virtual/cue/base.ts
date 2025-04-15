import { VirtualCanvasBase } from "../base.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { CueSegment, CueDot, Id } from "../../types.js";
import { CanvasConfig } from "../../../config/types.js";
import { Messaging7 } from "../../../messaging/impl.js";
import { IMessaging7 } from "../../../messaging/types.js";
import {
    ICueCanvas,
    DrawCueDotEvent,
    RemoveCueDotEvent,
    DrawCueDotListener,
    MoveCueSegmentEvent,
    DrawCueSegmentEvent,
    RemoveCueDotListener,
    RemoveCueSegmentEvent,
    DrawCueSegmentListener,
    MoveCueSegmentListener,
    RemoveCueSegmentListener,
} from "../types.js";

export abstract class CueCanvasBase extends VirtualCanvasBase implements ICueCanvas {
    private readonly messaging: IMessaging7<DrawCueDotEvent, DrawCueDotEvent, DrawCueSegmentEvent, RemoveCueDotEvent, MoveCueSegmentEvent, DrawCueSegmentEvent, RemoveCueSegmentEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging7();
    }

    public onDrawDot(listener: DrawCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDashDot(listener: DrawCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onDrawSegment(listener: DrawCueSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public onRemoveDot(listener: RemoveCueDotListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel4(listener);
    }

    public onMoveSegment(listener: MoveCueSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel5(listener);
    }

    public onDrawDashSegment(listener: DrawCueSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel6(listener);
    }

    public onRemoveSegment(listener: RemoveCueSegmentListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel7(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawDot(dot: CueDot, dotRadius: number, dotColor: string): void {
        const event = { dot, dotRadius, dotColor };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawDashDot(dot: CueDot, dotRadius: number, dotColor: string): void {
        const event = { dot, dotRadius, dotColor };
        this.messaging.sendToChannel2(event);
    }

    protected invokeDrawSegment(segment: CueSegment): void {
        const event = { segment };
        this.messaging.sendToChannel3(event);
    }

    protected invokeRemoveDot(dotId: Id): void {
        const event = { dotId };
        this.messaging.sendToChannel4(event);
    }

    protected invokeMoveSegment(segment: CueSegment): void {
        const event = { segment };
        this.messaging.sendToChannel5(event);
    }

    protected invokeDrawDashSegment(segment: CueSegment): void {
        const event = { segment };
        this.messaging.sendToChannel6(event);
    }

    protected invokeRemoveSegment(segmentId: Id): void {
        const event = { segmentId };
        this.messaging.sendToChannel7(event);
    }
}