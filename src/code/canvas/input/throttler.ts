import { Bounds } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    Position,
    MoveEvent,
    CanvasEvent,
    IInputCanvas,
    PointerUpEvent,
    CanvasEventType,
    PointerMoveEvent,
} from "./types.js";

export class InputCanvasThrottler extends InputCanvasBase {
    private readonly inputCanvas: IInputCanvas;

    private timerId?: number;
    private timerInterval: number;

    private groupedEvents: Array<CanvasEvent>;

    constructor(inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;

        this.groupedEvents = [];
        this.timerInterval = 30; // TODO: outside!!!

        this.subscribe();
    }

    public override set bounds(value: Bounds) {
        super.bounds = value;
        this.inputCanvas.bounds = value;
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

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);

        const pointerMoveUn = this.inputCanvas.onPointerMove(this.handlePointerMove.bind(this));
        super.registerUn(pointerMoveUn);

        const pointerUpUn = this.inputCanvas.onPointerUp(this.handlePointerUp.bind(this));
        super.registerUn(pointerUpUn);

        this.timerId = setInterval(this.handleTimer.bind(this), this.timerInterval);
    }

    private handleZoomIn(): void {
        const eventType = CanvasEventType.ZoomIn;
        this.addEvent(eventType);
    }

    private handleZoomOut(): void {
        const eventType = CanvasEventType.ZoomOut;
        this.addEvent(eventType);
    }

    private handleMove(event: MoveEvent): void {
        const eventType = CanvasEventType.Move;
        const position = event.position;
        this.addEvent(eventType, position);
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const eventType = CanvasEventType.PointerMove;
        const position = event.position;
        this.addEvent(eventType, position);
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const eventType = CanvasEventType.PointerUp;
        const position = event.position;
        this.addEvent(eventType, position);
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
            case CanvasEventType.Move: {
                super.invokeMove(position);
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

    private addEvent(eventType: CanvasEventType, position?: Position,): void {
        // extract the algorithm in a different class
        const events = this.groupedEvents;

        if (events.length !== 0) {
            const lastEvent = events.pop()!;

            if (lastEvent.type !== eventType) {
                events.push(lastEvent);
            }
        }

        const currentEvent = { type: eventType, value: position };
        events.push(currentEvent);
    }
}