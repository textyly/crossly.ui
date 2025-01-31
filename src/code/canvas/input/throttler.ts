import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    CanvasEvent,
    CanvasEventType,
    IInputCanvas,
    PointerMoveEvent,
    PointerUpEvent,
    Position,
} from "./types.js";

export class InputCanvasThrottler extends InputCanvasBase implements IInputCanvas {
    private readonly inputCanvas: IInputCanvas;

    private groupedEvents: Array<CanvasEvent>;

    private timerInterval: number;
    private timerId?: number;

    constructor(inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;

        this.groupedEvents = [];
        this.timerInterval = 70; // TODO: outside!!!

        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        this.inputCanvas.size = value;
    }

    public override dispose(): void {
        clearInterval(this.timerId);
        this.invokeEvents();
        super.dispose();
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        this.timerId = setInterval(this.handleTimer.bind(this), this.timerInterval);
    }

    private handleZoomIn(): void {
        const eventType = CanvasEventType.ZoomIn;
        this.handleEvent(eventType);
    }

    private handleZoomOut(): void {
        const eventType = CanvasEventType.ZoomOut;
        this.handleEvent(eventType);
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const eventType = CanvasEventType.PointerMove;
        const position = event.position;
        this.handleEvent(eventType, position);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const eventType = CanvasEventType.PointerUp;
        const position = event.position;
        this.handleEvent(eventType, position);
    }

    private handleEvent(eventType: CanvasEventType, position?: Position,): void {
        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: eventType, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== eventType) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: eventType, value: position });
        }
    }

    private handleTimer(): void {
        this.invokeEvents();
    }

    private invokeEvents(): void {
        this.groupedEvents.forEach((event) => this.invokeEvent(event));
        this.groupedEvents = [];
    }

    private invokeEvent(event: CanvasEvent): void {
        const type = event?.type!;
        const position = event?.value!;

        switch (type) {
            case CanvasEventType.ZoomIn: {
                super.invokeZoomIn();
                break;
            }
            case CanvasEventType.ZoomOut: {
                super.invokeZoomOut();
                break;
            }
            case CanvasEventType.PointerMove: {
                super.invokePointerMove(position);
                break;
            }
            case CanvasEventType.PointerUp: {
                super.invokePointerUp(position);
                break;
            }
        }
    }
}