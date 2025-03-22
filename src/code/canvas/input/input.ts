import { MoveInput } from "./move.js";
import { TouchInput } from "./touch.js";
import { InputCanvasBase } from "./base.js";
import { InputCanvasConfig } from "../../config/types.js";
import {
    Position,
    MoveEvent,
    IMoveInput,
    ZoomInEvent,
    ITouchInput,
    ZoomOutEvent,
    MoveStopEvent,
    MoveStartEvent,
    CanvasEventType,
    WheelChangeHandler,
    PointerEventHandler,
} from "./types.js";

export class InputCanvas extends InputCanvasBase {
    private readonly config: InputCanvasConfig;
    private readonly htmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;
    private readonly moveInput: IMoveInput;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;

    private isPointerDown: boolean;

    constructor(config: InputCanvasConfig, htmlElement: HTMLElement) {
        super();
        this.config = config;
        this.htmlElement = htmlElement;

        const bounds = { left: htmlElement.clientLeft, top: htmlElement.clientTop, width: htmlElement.clientWidth, height: htmlElement.clientHeight };
        super.bounds = bounds;

        const ignoreZoomUntil = this.config.ignoreZoomUntil;
        this.touchInput = new TouchInput(ignoreZoomUntil, htmlElement);

        const ignoreMoveUntil = this.config.ignoreMoveUntil;
        this.moveInput = new MoveInput(ignoreMoveUntil, htmlElement, this.touchInput);

        this.isPointerDown = false;

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);

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
        this.htmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.htmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        // TODO: handle resize!!!

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
        this.htmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.htmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
    }

    private handleZoomIn(event: ZoomInEvent): void {
        super.invokeZoomIn(event.currentPosition);
    }

    private handleZoomOut(event: ZoomOutEvent): void {
        super.invokeZoomOut(event.currentPosition);
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

    private handleWheelChange(event: WheelEvent): void {
        this.wheelChange(event);

        event.preventDefault();
    }

    private handlePointerUp(event: PointerEvent): void {
        this.isPointerDown = false;

        if (this.touchInput.inZoomMode) {
            return;
        }

        if (this.moveInput.inMoveMode) {
            return;
        }

        this.pointerUp(event);
    }

    private handlePointerDown(event: PointerEvent): void {
        this.isPointerDown = true;
    }

    private handlePointerMove(event: PointerEvent): void {
        if (this.touchInput.inZoomMode) {
            return;
        }

        if (this.moveInput.inMoveMode) {
            return;
        }

        if (!this.isPointerDown) {
            this.pointerMove(event);
        }
    }

    private wheelChange(event: WheelEvent): void {
        const deltaY = event.deltaY;

        const currentPosition = this.getPosition(event);
        const e = { currentPosition };
        deltaY < 0 ? this.handleZoomIn(e) : this.handleZoomOut(e);
    }

    private pointerUp(event: PointerEvent): void {
        const position = this.getPosition(event);
        const leftButton = 0;
        if (event.button === leftButton) {
            const e = { position };
            super.invokePointerUp(e);
        }
    }

    private pointerMove(event: PointerEvent): void {
        const position = this.getPosition(event);
        const e = { position };
        super.invokePointerMove(e);
    }

    private getPosition(event: MouseEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }
}