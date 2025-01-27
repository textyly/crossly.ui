import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import { HtmlCanvasEvents, MouseEventHandler, Position, WheelChangeHandler, WheelEvent } from "./types.js";

export class InputCanvas extends InputCanvasBase {
    private readonly htmlElement: HTMLElement;
    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly mouseMoveHandler: MouseEventHandler;
    private readonly mouseButtonDownHandler: MouseEventHandler;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseButtonDownHandler = this.handleMouseButtonDown.bind(this)

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
        super.dispose();
    }

    private getPosition(event: MouseEvent): Position {
        const rect = this.htmlElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(HtmlCanvasEvents.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.MouseMove, this.mouseMoveHandler);
        this.htmlElement.addEventListener(HtmlCanvasEvents.MouseDown, this.mouseButtonDownHandler);
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
}