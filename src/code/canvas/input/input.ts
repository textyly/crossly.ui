import { MoveInput } from "./move.js";
import { TouchInput } from "./touch.js";
import { InputCanvasBase } from "./base.js";
import {
    Position,
    MoveEvent,
    IMoveInput,
    ITouchInput,
    CanvasEventType,
    WheelChangeHandler,
    PointerEventHandler,
    MoveStartEvent,
    MoveStopEvent,
} from "./types.js";
import { InputCanvasConfig } from "../types.js";

export class InputCanvas extends InputCanvasBase {
    private readonly config: InputCanvasConfig;
    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;
    private readonly moveInput: IMoveInput;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;

    constructor(config: InputCanvasConfig,  htmlElement: HTMLElement) {
        super();
        this.config = config;
        this.htmlElement = htmlElement;

        const bounds = { left: htmlElement.clientLeft, top: htmlElement.clientTop, width: htmlElement.clientWidth, height: htmlElement.clientHeight };
        super.bounds = bounds;

        this.touchInput = new TouchInput(htmlElement);
        this.moveInput = new MoveInput(htmlElement, this.touchInput, this.config.ignoreMoveUntil);

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);

        this.subscribe();
    }

    public override dispose(): void {
        this.unsubscribe();

        this.moveInput.dispose();
        this.touchInput.dispose();

        super.dispose();
    }

    private subscribe(): void {
        this.htmlElement.addEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);

        const touchZoomInUn = this.touchInput.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(touchZoomInUn);

        const touchZoomOutUn = this.touchInput.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(touchZoomOutUn);

        const moveStartUn = this.moveInput.onMoveStart(this.handleMoveStart.bind(this));
        super.registerUn(moveStartUn);

        const moveUn = this.moveInput.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);

        const moveStopUn = this.moveInput.onMoveStop(this.handleMoveStop.bind(this));
        super.registerUn(moveStopUn);

        this.touchInput.subscribe();
        this.moveInput.subscribe();
    }

    private unsubscribe(): void {
        this.htmlElement.removeEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
    }

    private handleWheelChange(event: WheelEvent): void {
        const deltaY = event.deltaY;
        deltaY < 0 ? this.handleZoomIn() : this.handleZoomOut();
        event.preventDefault();
    }

    private handleZoomIn(): void {
        super.invokeZoomIn();
    }

    private handleZoomOut(): void {
        super.invokeZoomOut();
    }

    private handleMoveStart(event: MoveStartEvent): void {
        super.invokeMoveStart(event);
    }

    private handleMove(event: MoveEvent): void {
        super.invokeMove(event);
    }

    private handleMoveStop(event: MoveStopEvent): void {
        super.invokeMoveStop(event);
    }

    private handlePointerUp(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        if (this.moveInput.inMoveMode) {
            return;
        }

        const position = this.getPosition(event);
        const leftButton = 0;
        if (event.button === leftButton) {
            super.invokePointerUp({ position });
        }
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        if (this.moveInput.inMoveMode) {
            return;
        }

        const position = this.getPosition(event);
        super.invokePointerMove({ position });
    }

    private handlePointerDown(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        // TODO: create move held event
    }

    private getPosition(event: PointerEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}