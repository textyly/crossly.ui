import { CanvasConfig } from "../../types.js";
import { IInputCanvas } from "../../input/types.js";
import { VoidUnsubscribe } from "../../../types.js";
import { Messaging2 } from "../../../messaging/impl.js";
import { IMessaging2 } from "../../../messaging/types.js";
import {
    IStitchCanvas,
    DrawStitchDotsEvent,
    DrawStitchDotsListener,
    DrawStitchThreadsEvent,
    DrawStitchThreadsListener,
} from "../types.js";
import { VirtualCanvasBase } from "../virtual.js";

export abstract class StitchCanvasBase extends VirtualCanvasBase implements IStitchCanvas {
    private readonly messaging: IMessaging2<DrawStitchThreadsEvent, DrawStitchDotsEvent>;

    constructor(config: CanvasConfig, input: IInputCanvas) {
        super(config, input);
        this.messaging = new Messaging2();
    }

    public onDrawThreads(listener: DrawStitchThreadsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onDrawDots(listener: DrawStitchDotsListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public override dispose(): void {
        this.messaging.dispose();
        super.dispose();
    }

    protected invokeDrawThreads(visible: Array<boolean>, fromDotsX: Array<number>, fromDotsY: Array<number>, toDotsX: Array<number>, toDotsY: Array<number>, widths: Array<number>, colors: Array<string>): void {
        const event = { visible, fromDotsX, fromDotsY, toDotsX, toDotsY, widths, colors };
        this.messaging.sendToChannel1(event);
    }

    protected invokeDrawDots(dotsX: Array<number>, dotsY: Array<number>, dotRadius: number, dotColor: string): void {
        const event = { dotsX, dotsY, dotRadius, dotColor };
        this.messaging.sendToChannel2(event);
    }
}