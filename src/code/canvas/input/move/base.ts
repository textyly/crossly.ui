import { CanvasBase } from "../../base.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging3 } from "../../../messaging/impl.js";
import { IMessaging3 } from "../../../messaging/types.js";
import {
    Position,
    MoveEvent,
    MoveListener,
    MoveStopEvent,
    MoveStartEvent,
    MoveStopListener,
    MoveStartListener,
} from "../types.js";

export abstract class MoveInputBase extends CanvasBase {
    private readonly messaging: IMessaging3<MoveStartEvent, MoveEvent, MoveStopEvent>;

    constructor(className: string) {
        super(className);
        this.messaging = new Messaging3();
    }

    public onMoveStart(listener: MoveStartListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onMove(listener: MoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onMoveStop(listener: MoveStopListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public override dispose(): void {
        super.ensureAlive();
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeMoveStart(previousPosition: Position, currentPosition: Position): void {
        const event = { previousPosition, currentPosition };
        this.messaging.sendToChannel1(event);
    }

    protected invokeMove(previousPosition: Position, currentPosition: Position): void {
        const event = { previousPosition, currentPosition };
        this.messaging.sendToChannel2(event);
    }

    protected invokeMoveStop(position: Position): void {
        const event = { position };
        this.messaging.sendToChannel3(event);
    }
}