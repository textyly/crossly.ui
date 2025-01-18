import { Messaging3 } from "../../messaging/impl.js";
import { IMessaging3 } from "../../messaging/types.js";
import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import { HtmlCanvasEvents, ITransparentCanvas, MouseButtonDownEvent, MouseEventHandler, MouseMoveEvent, Position, WheelChangeHandler, WheelEvent } from "./types.js";

export class InputCanvas extends InputCanvasBase {

    //#region fields
    private readonly svgCanvas: HTMLElement;
    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly mouseMoveHandler: MouseEventHandler;
    private readonly mouseButtonDownHandler: MouseEventHandler;

    //#endregion

    constructor(svgCanvas: HTMLElement) {
        super();

        this.svgCanvas = svgCanvas;
        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.mouseMoveHandler = this.handleMouseMove.bind(this);
        this.mouseButtonDownHandler = this.handleMouseButtonDown.bind(this)

        this.subscribe();
    }

    // #region abstract overrides

    private subscribe(): void {
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

    public override set size(value: Size) {
        super.size = value;
        const width = value.width.toString();
        const height = value.height.toString();

        this.svgCanvas.setAttribute("width", width);
        this.svgCanvas.setAttribute("height", height);
    }

    // #endregion

    // #region events 

    private handleWheelChange(event: WheelEvent): void {
        const deltaY = event.deltaY;
        deltaY < 0 ? super.invokeZoomIn() : super.invokeZoomOut();
    }

    private handleMouseMove(event: MouseEvent): void {
        const position = this.getPosition(event);
        const mouseMoveEvent = { position };
        super.invokeMouseMove(mouseMoveEvent);
    }

    private handleMouseButtonDown(event: MouseEvent): void {
        const position = this.getPosition(event);
        const leftButton = 0;
        if (event.button === leftButton) {
            const mouseLeftButtonDownEvent = { position, button: event.button };
            super.invokeMouseLeftButtonDown(mouseLeftButtonDownEvent);
        }
    }

    // #endregion

    // #region methods 

    private getPosition(event: MouseEvent): Position {
        const rect = this.svgCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    // #endregion
}