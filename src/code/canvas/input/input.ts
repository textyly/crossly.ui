import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    HtmlCanvasEvents,
    IInputCanvas,
    MouseEventHandler,
    Position,
    TouchEventHandler,
    WheelChangeHandler
} from "./types.js";

export class InputCanvas extends InputCanvasBase implements IInputCanvas {
    private readonly htmlElement: HTMLElement;
    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly mouseMoveHandler: MouseEventHandler;
    private readonly mouseButtonDownHandler: MouseEventHandler;
    private readonly mouseButtonUpHandler: MouseEventHandler;

    private readonly touchMoveHandler: TouchEventHandler;
    private readonly touchStartHandler: TouchEventHandler;
    private readonly touchEndHandler: TouchEventHandler;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseButtonDownHandler = this.handleMouseButtonDown.bind(this);
        this.mouseButtonUpHandler = this.handleMouseButtonUp.bind(this);

        this.touchMoveHandler = this.handleTouchMove.bind(this);
        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);

        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.htmlElement.style.width = width + "px";
        this.htmlElement.style.height = height + "px";
    }

    public override dispose(): void {
        this.htmlElement.removeEventListener(HtmlCanvasEvents.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(HtmlCanvasEvents.MouseMove, this.mouseMoveHandler);
        this.htmlElement.removeEventListener(HtmlCanvasEvents.MouseDown, this.mouseButtonDownHandler);
        this.htmlElement.removeEventListener(HtmlCanvasEvents.MouseUp, this.mouseButtonUpHandler);

        this.htmlElement.removeEventListener(HtmlCanvasEvents.TouchMove, this.touchMoveHandler);
        this.htmlElement.removeEventListener(HtmlCanvasEvents.TouchStart, this.touchStartHandler);
        this.htmlElement.removeEventListener(HtmlCanvasEvents.TouchEnd, this.touchEndHandler);

        super.dispose();
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(HtmlCanvasEvents.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.MouseMove, this.mouseMoveHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.MouseDown, this.mouseButtonDownHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.MouseUp, this.mouseButtonUpHandler);

        this.htmlElement.addEventListener(HtmlCanvasEvents.TouchMove, this.touchMoveHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.TouchStart, this.touchStartHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.TouchEnd, this.touchEndHandler);
    }

    private handleWheelChange(event: WheelEvent): void {
        if (event.ctrlKey) {
            const deltaY = event.deltaY;
            deltaY < 0 ? super.invokeZoomIn() : super.invokeZoomOut();
            event.preventDefault();
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        const position = this.getPosition(event);
        super.invokeMouseMove(position);
    }

    private handleMouseButtonDown(event: MouseEvent): void {
        const position = this.getPosition(event);

        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokeMouseLeftButtonDown(position);
        }
    }

    private handleMouseButtonUp(event: MouseEvent): void {
        const position = this.getPosition(event);

        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokeMouseLeftButtonUp(position);
        }
    }

    private handleTouchMove(event: TouchEvent): void {
        const positions = this.getTouchPositions(event);
        super.invokeTouchMove(positions);
        event.preventDefault();
    }

    private handleTouchStart(event: TouchEvent): void {
        const positions = this.getTouchPositions(event);
        super.invokeTouchStart(positions);
        event.preventDefault();
    }

    private handleTouchEnd(event: TouchEvent): void {
        const positions = this.getTouchPositions(event);
        super.invokeTouchEnd(positions);
        event.preventDefault();
    }

    private getPosition(event: MouseEvent): Position {
        const rect = this.htmlElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    private getTouchPositions(event: TouchEvent): Array<Position> {
        const rect = this.htmlElement.getBoundingClientRect();
        const positions: Array<Position> = [];

        const touches = event.touches;
        for (let touchIdX = 0; touchIdX < touches.length; ++touchIdX) {

            const touch = touches[touchIdX];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            const position = { x, y };
            positions.push(position);
        }

        return positions;
    }
}