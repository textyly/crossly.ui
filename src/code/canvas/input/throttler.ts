import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    CanvasEvent,
    CanvasEventsType,
    IInputCanvas,
    PointerMoveEvent,
    PointerUpEvent,
} from "./types.js";

// TODO: all methods should have a common one
export class InputCanvasThrottler extends InputCanvasBase {
    private readonly inputCanvas: IInputCanvas;

    private groupedEvents: Array<CanvasEvent>;

    private timerInterval: number;
    private timerId?: number;

    constructor(inputCanvas: IInputCanvas) {
        super();

        this.inputCanvas = inputCanvas;

        this.groupedEvents = [];
        this.timerInterval = 70; // TODO: outside!!!
5
        this.subscribe();
    }

    public override set size(value: Size) {
        super.size = value;
        this.inputCanvas.size = value;
    }

    public override dispose(): void {
        clearInterval(this.timerId);
        this.handleEvents();
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
        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventsType.ZoomIn });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventsType.ZoomIn) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventsType.ZoomIn });
        }
    }

    private handleZoomOut(): void {
        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventsType.ZoomOut });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventsType.ZoomOut) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventsType.ZoomOut });
        }
    }

    private handlePointerMove(event: PointerMoveEvent): void {
        const position = event.position;

        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventsType.PointerMove, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventsType.PointerMove) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventsType.PointerMove, value: position });
        }
    }

    private handlePointerUp(event: PointerUpEvent): void {
        const position = event.position;

        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventsType.PointerUp, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventsType.PointerUp) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventsType.PointerUp, value: position });
        }
    }

    private handleTimer(): void {
        this.handleEvents();
    }

    private handleEvents(): void {
        this.groupedEvents.forEach((event) => this.handleEvent(event));
        this.groupedEvents = [];
    }

    private handleEvent(event: CanvasEvent): void {
        const type = event?.type!;
        const position = event?.value!;

        switch (type) {
            case CanvasEventsType.ZoomIn: {
                super.invokeZoomIn();
                break;
            }
            case CanvasEventsType.ZoomOut: {
                super.invokeZoomOut();
                break;
            }
            case CanvasEventsType.PointerMove: {
                super.invokePointerMove(position);
                break;
            }
            case CanvasEventsType.PointerUp: {
                super.invokePointerUp(position);
                break;
            }
        }
    }
}