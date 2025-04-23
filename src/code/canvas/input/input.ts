import { MoveInput } from "./move/move.js";
import { TouchInput } from "./touch/touch.js";
import { InputCanvasBase } from "./base.js";
import assert from "../../asserts/assert.js";
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
    KeyDownEventHandler,
} from "./types.js";

export class InputCanvas extends InputCanvasBase {
    private readonly config: InputCanvasConfig;
    private readonly inputHtmlElement: HTMLElement;
    private readonly touchInput: ITouchInput;
    private readonly moveInput: IMoveInput;

    private readonly wheelChangeHandler: WheelChangeHandler;
    private readonly pointerUpHandler: PointerEventHandler;
    private readonly pointerDownHandler: PointerEventHandler;
    private readonly pointerMoveHandler: PointerEventHandler;
    private readonly keyDownHandler: KeyDownEventHandler;

    private isPointerDown: boolean;
    private readonly resizeObserver: ResizeObserver;

    constructor(config: InputCanvasConfig, inputHtmlElement: HTMLElement) {
        super(InputCanvas.name);
        this.config = config;
        assert.defined(this.config, "InputCanvasConfig");

        this.inputHtmlElement = inputHtmlElement;
        assert.defined(this.inputHtmlElement, "inputHtmlElement");

        const bounds = { left: inputHtmlElement.clientLeft, top: inputHtmlElement.clientTop, width: inputHtmlElement.clientWidth, height: inputHtmlElement.clientHeight };
        super.bounds = bounds;

        const ignoreZoomUntil = this.config.ignoreZoomUntil;
        this.touchInput = new TouchInput(ignoreZoomUntil, inputHtmlElement);

        const ignoreMoveUntil = this.config.ignoreMoveUntil;
        this.moveInput = new MoveInput(ignoreMoveUntil, inputHtmlElement, this.touchInput);

        this.wheelChangeHandler = this.handleWheelChange.bind(this);
        this.pointerUpHandler = this.handlePointerUp.bind(this);
        this.pointerDownHandler = this.handlePointerDown.bind(this);
        this.pointerMoveHandler = this.handlePointerMove.bind(this);
        this.keyDownHandler = this.handleKeyDown.bind(this);

        this.isPointerDown = false;
        this.resizeObserver = new ResizeObserver(this.handleBoundsChange.bind(this));

        this.subscribe();
    }

    public override dispose(): void {
        super.ensureAlive();

        this.unsubscribe();
        this.moveInput.dispose();
        this.touchInput.dispose();

        super.dispose();
    }

    private handleZoomIn(event: ZoomInEvent): void {
        super.ensureAlive();
        assert.defined(event, "ZoomInEvent");

        super.invokeZoomIn(event);
    }

    private handleZoomOut(event: ZoomOutEvent): void {
        super.ensureAlive();
        assert.defined(event, "ZoomOutEvent");

        super.invokeZoomOut(event);
    }

    private handleMoveStart(event: MoveStartEvent): void {
        super.ensureAlive();
        assert.defined(event, "MoveStartEvent");

        super.invokeMoveStart(event);
    }

    private handleMove(event: MoveEvent): void {
        super.ensureAlive();
        assert.defined(event, "MoveEvent");

        super.invokeMove(event);
    }

    private handleMoveStop(event: MoveStopEvent): void {
        super.ensureAlive();
        assert.defined(event, "MoveStopEvent");

        super.invokeMoveStop(event);
    }

    private handleWheelChange(event: WheelEvent): void {
        super.ensureAlive();
        assert.defined(event, "WheelEvent");

        this.wheelChange(event);
        event.preventDefault();
    }

    private handlePointerUp(event: PointerEvent): void {
        super.ensureAlive();
        assert.defined(event, "PointerUpEvent");

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
        super.ensureAlive();
        assert.defined(event, "PointerDownEvent");

        this.isPointerDown = true;
    }

    private handlePointerMove(event: PointerEvent): void {
        super.ensureAlive();
        assert.defined(event, "PointerMoveEvent");

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

    private handleKeyDown(event: KeyboardEvent): void {
        super.ensureAlive();
        assert.defined(event, "KeyboardEvent");

        const keyZ = "KeyZ";

        if (event.ctrlKey && event.code == keyZ) {
            super.invokeUndo();
        }
    }

    private handleBoundsChange(event: ResizeObserverEntry[]): void {
        super.ensureAlive();
        assert.defined(event, "ResizeObserverEntries");

        this.boundsChange(event);
    }

    private wheelChange(event: WheelEvent): void {
        const currentPosition = this.getPosition(event);
        const isVisible = this.isVisible(currentPosition);

        if (isVisible) {
            const e = { currentPosition };
            const deltaY = event.deltaY;

            deltaY < 0 ? this.handleZoomIn(e) : this.handleZoomOut(e);
        }
    }

    private pointerUp(event: PointerEvent): void {
        const position = this.getPosition(event);
        const isVisible = this.isVisible(position);

        if (isVisible) {
            const leftButton = 0;
            if (event.button === leftButton) {
                const e = { position };
                super.invokePointerUp(e);
            }
        }
    }

    private pointerMove(event: PointerEvent): void {
        const position = this.getPosition(event);
        const isVisible = this.isVisible(position);

        if (isVisible) {
            const e = { position };
            super.invokePointerMove(e);
        }
    }

    private boundsChange(events: ResizeObserverEntry[]): void {
        events.forEach((event) => {
            const bounds = event.contentRect;
            super.bounds = bounds;
        });
    }

    private isVisible(position: Position): boolean {
        return position.x > 0 && position.y > 0;
    }

    private getPosition(event: MouseEvent): Position {
        const x = event.layerX;
        const y = event.layerY;
        return { x, y };
    }

    private subscribe(): void {
        this.inputHtmlElement.addEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.inputHtmlElement.addEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.inputHtmlElement.addEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.inputHtmlElement.addEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.inputHtmlElement.addEventListener(CanvasEventType.KeyDown, this.keyDownHandler);

        this.resizeObserver.observe(this.inputHtmlElement);

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
        this.inputHtmlElement.removeEventListener(CanvasEventType.WheelChange, this.wheelChangeHandler);
        this.inputHtmlElement.removeEventListener(CanvasEventType.PointerUp, this.pointerUpHandler);
        this.inputHtmlElement.removeEventListener(CanvasEventType.PointerMove, this.pointerMoveHandler);
        this.inputHtmlElement.removeEventListener(CanvasEventType.PointerDown, this.pointerDownHandler);
        this.inputHtmlElement.removeEventListener(CanvasEventType.KeyDown, this.keyDownHandler);

        this.resizeObserver.unobserve(this.inputHtmlElement);
    }
}