import { Size } from "../types.js";
import { InputCanvasBase } from "./base.js";
import {
    CanvasEvent,
    IInputCanvas,
    MouseMoveEvent,
    CanvasEventType,
    MouseLeftButtonDownEvent,
    MouseLeftButtonUpEvent,
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
        this.timerInterval = 50; // TODO: outside!!!

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

        const mouseMoveUn = this.inputCanvas.onMouseMove(this.handleMouseMove.bind(this));
        super.registerUn(mouseMoveUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);

        const mouseLeftButtonUpUn = this.inputCanvas.onMouseLeftButtonUp(this.handleMouseLeftButtonUp.bind(this));
        super.registerUn(mouseLeftButtonUpUn);

        this.timerId = setInterval(this.handleTimer.bind(this), this.timerInterval);
    }

    private handleZoomIn(): void {
        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventType.ZoomIn });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventType.ZoomIn) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventType.ZoomIn });
        }
    }

    private handleZoomOut(): void {
        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventType.ZoomOut });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventType.ZoomOut) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventType.ZoomOut });
        }
    }

    private handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;

        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventType.MouseMove, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventType.MouseMove) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventType.MouseMove, value: position });
        }
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;

        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventType.MouseLeftButtonDown, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventType.MouseLeftButtonDown) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventType.MouseLeftButtonDown, value: position });
        }
    }

    private handleMouseLeftButtonUp(event: MouseLeftButtonUpEvent): void {
        const position = event.position;

        if (this.groupedEvents.length == 0) {
            this.groupedEvents.push({ type: CanvasEventType.MouseLeftButtonUp, value: position });
        } else {
            const lastEvent = this.groupedEvents.pop()!;

            if (lastEvent.type !== CanvasEventType.MouseLeftButtonUp) {
                this.groupedEvents.push(lastEvent);
            }

            this.groupedEvents.push({ type: CanvasEventType.MouseLeftButtonUp, value: position });
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
            case CanvasEventType.ZoomIn: {
                super.invokeZoomIn();
                break;
            }
            case CanvasEventType.ZoomOut: {
                super.invokeZoomOut();
                break;
            }
            case CanvasEventType.MouseMove: {
                super.invokeMouseMove(position);
                break;
            }
            case CanvasEventType.MouseLeftButtonDown: {
                super.invokeMouseLeftButtonDown(position);
                break;
            }
            case CanvasEventType.MouseLeftButtonUp: {
                super.invokeMouseLeftButtonUp(position);
                break;
            }
        }
    }
}