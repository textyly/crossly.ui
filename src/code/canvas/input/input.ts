import { Size } from "../types.js";
import { TouchInput } from "./touch.js";
import { InputCanvasBase } from "./base.js";
import { CanvasEventsType, IInputCanvas, ITouchInput, PointerEventHandler, Position, WheelChangeHandler } from "./types.js";

export class InputCanvas extends InputCanvasBase implements IInputCanvas {
    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerHoldingDownHandler: PointerEventHandler;
    private readonly pointerUpHandler: PointerEventHandler;

    constructor(htmlElement: HTMLElement) {
        super();

        this.htmlElement = htmlElement;
        this.touchInput = new TouchInput(htmlElement);

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerHoldingDownHandler = this.handlePointerDown.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);

        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        const width = ((window.innerWidth / 10) * 9.8) + "px"; //value.width.toString() + "px";
        const height = ((window.innerHeight / 10) * 9.3) + "px"; //value.height.toString() + "px";

        this.htmlElement.style.width = width;
        this.htmlElement.style.height = height;
    }

    public override dispose(): void {
        this.unsubscribe();
        this.touchInput.dispose();
        super.dispose();
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.addEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);

        const touchZoomInUn = this.touchInput.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(touchZoomInUn);

        const touchZoomOutUn = this.touchInput.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(touchZoomOutUn);
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventsType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerDown, this.pointerHoldingDownHandler);
        this.htmlElement.removeEventListener(CanvasEventsType.PointerUp, this.pointerUpHandler);
    }

    private handleWheelChange(event: WheelEvent): void {
        if (event.ctrlKey) {
            const deltaY = event.deltaY;
            deltaY < 0 ? this.handleZoomIn() : this.handleZoomOut();
            event.preventDefault();
        }
    }

    private handleZoomIn(): void {
        super.invokeZoomIn();
    }

    private handleZoomOut(): void {
        super.invokeZoomOut();
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        const position = this.getPosition(event);
        super.invokePointerMove(position);
    }

    private handlePointerDown(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }
        // TODO:
        // super.invokePointerHoldingDown();
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        const position = this.getPosition(event);
        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokePointerUp(position);
        }
    }

    private getPosition(event: PointerEvent): Position {
        const rect = this.htmlElement.getBoundingClientRect();
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}