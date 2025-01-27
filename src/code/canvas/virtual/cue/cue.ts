import { CueCanvasBase } from "./base.js";
import { ICueCanvas, IGridCanvas } from "../types.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { IInputCanvas, MouseLeftButtonDownEvent, MouseMoveEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, CueThread, SizeChangeEvent, GridDot, Size, CueCanvasConfig } from "../../types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private readonly ids: IdGenerator;
    private readonly converter: Converter;

    private currentThread?: CueThread;
    private currentSide: CanvasSide;

    private previouslyClickedDotId?: Id;
    private previouslyHoveredDotId?: Id;

    constructor(config: CueCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.ids = new IdGenerator();
        this.converter = new Converter();
        this.currentSide = CanvasSide.Back;

        this.subscribe();
    }

    public override draw(): void {
        this.redraw();
    }

    private redraw(): void {
        this.ids.reset();

        const previouslyHovered = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);
        this.removeHoveredDot(previouslyHovered);

        if (this.currentThread) {
            const position = this.currentThread.to;
            this.resizeThread(position);
        }
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

        const sizeChangeUn = this.gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleZoomIn(): void {
        super.zoomIn();
    }

    private handleZoomOut(): void {
        super.zoomOut();
    }

    private handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        this.moveDot(position);
        this.resizeThread(position);
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.changeSide(position);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        this.changeSize(size);
    }

    private moveDot(position: Position): void {
        const currentlyHovered = this.gridCanvas.getDotByPosition(position);
        const previouslyHovered = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);

        if (!currentlyHovered) {
            this.removeHoveredDot(previouslyHovered);
        } else if (currentlyHovered.id !== previouslyHovered?.id) {
            this.removeHoveredDot(previouslyHovered);
            this.hoverDot(currentlyHovered);
        }
    }

    private resizeThread(position: Position): void {
        const previousClickedDot = this.gridCanvas.getDotById(this.previouslyClickedDotId!);

        if (!previousClickedDot) {
            return;
        }

        if (this.currentThread) {
            this.currentThread = this.createThread(previousClickedDot, position, this.currentThread.id);
            super.invokeMoveThread(this.currentThread);
        } else {
            const threadId = this.ids.next();
            this.currentThread = this.createThread(previousClickedDot, position, threadId);
            this.drawThread(this.currentThread);
        }
    }

    private changeSide(position: Position): void {
        const clickedDot = this.gridCanvas.getDotByPosition(position);
        if (clickedDot) {

            this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
            this.previouslyClickedDotId = clickedDot.id;

            if (this.currentThread) {
                super.invokeRemoveThread(this.currentThread);
                this.currentThread = undefined;
            }
        }
    }

    private changeSize(size: Size): void {
        super.size = size;
        this.draw();
    }

    private hoverDot(hoveredDot: GridDot): void {
        this.previouslyHoveredDotId = hoveredDot.id;
        const hovered = { id: hoveredDot.id, x: hoveredDot.x, y: hoveredDot.y, radius: this.dotRadius, color: this.dotColor };
        super.invokeDrawDot(hovered);
    }

    private removeHoveredDot(hoveredDot?: GridDot): void {
        if (hoveredDot) {
            super.invokeRemoveDot(hoveredDot);
            this.previouslyHoveredDotId = undefined;
        }
    }

    private drawThread(thread: CueThread): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawThread(thread);
        } else {
            super.invokeDrawDashThread(thread);
        }
    }

    private createThread(previousClickedDot: GridDot, currentMousePosition: Position, threadId: Id): CueThread {
        const fromDot = this.converter.convertToCueDot(previousClickedDot, this.dotColor);

        const toDotId = this.ids.next();
        const toDot = { ...currentMousePosition, id: toDotId, radius: this.dotRadius, color: this.dotColor };

        const thread = { id: threadId, from: fromDot, to: toDot, width: this.threadWidth, color: this.threadColor };
        return thread;
    }
}