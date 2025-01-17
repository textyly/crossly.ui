import { VoidUnsubscribe } from "../../types.js";
import { Messaging3 } from "../../messaging/impl.js";
import { SvgCanvasBase } from "../drawing/svg/base.js";
import { IMessaging3 } from "../../messaging/types.js";
import { MouseEventHandler, Position, WheelChangeHandler } from "./types.js";
import {
    HtmlCanvasEvents,
    ITransparentCanvas,
    MouseButtonDownListener,
    MouseMoveListener,
    WheelListener,
    WheelEvent,
    MouseMoveEvent,
    MouseButtonDownEvent
} from "./types.js";

export class TransparentCanvas extends SvgCanvasBase implements ITransparentCanvas {
    private readonly messaging: IMessaging3<WheelEvent, MouseMoveEvent, MouseButtonDownEvent>;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly mouseMoveHandler: MouseEventHandler;
    private readonly mouseButtonDownHandler: MouseEventHandler;

    constructor(svgCanvas: HTMLElement) {
        super(svgCanvas);

        this.messaging = new Messaging3(TransparentCanvas.name);

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseButtonDownHandler = this.handleMouseButtonDown.bind(this);
    }

    public onWheelChange(listener: WheelListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public onMouseMove(listener: MouseMoveListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel2(listener);
    }

    public onMouseButtonDown(listener: MouseButtonDownListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel3(listener);
    }

    public initialize(): void {
        this.svgCanvas.addEventListener(HtmlCanvasEvents.WheelChange, this.wheelChangeHandler);
        this.svgCanvas.addEventListener(HtmlCanvasEvents.MouseMove, this.mouseMoveHandler);
        this.svgCanvas.addEventListener(HtmlCanvasEvents.MouseDown, this.mouseButtonDownHandler);
    }

    public override dispose(): void {
        this.svgCanvas.removeEventListener(HtmlCanvasEvents.WheelChange, this.wheelChangeHandler);
        this.svgCanvas.removeEventListener(HtmlCanvasEvents.MouseMove, this.mouseMoveHandler);
        this.svgCanvas.removeEventListener(HtmlCanvasEvents.MouseDown, this.mouseButtonDownHandler);
        super.dispose();
    }

    private handleWheelChange(event: WheelEvent): void {
        this.messaging.sendToChannel1(event);
    }

    private handleMouseMove(event: MouseEvent): void {
        const position = this.getPosition(event);
        const mouseMoveEvent = { position };
        this.messaging.sendToChannel2(mouseMoveEvent);
    }

    private handleMouseButtonDown(event: MouseEvent): void {
        const position = this.getPosition(event);
        const mouseLeftButtonDownEvent = { position, button: event.button };
        this.messaging.sendToChannel3(mouseLeftButtonDownEvent);
    }

    private getPosition(event: MouseEvent): Position {
        const rect = this.svgCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }
}