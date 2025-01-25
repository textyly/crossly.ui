import { CueCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CueCanvasConfig, ICueCanvas, IGridCanvas } from "../types.js";
import { CanvasSide, Id, CueLine, SizeChangeEvent, GridDot, Size } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, MouseMoveEvent, Position } from "../../input/types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private readonly ids: IdGenerator;
    private readonly converter: Converter;

    private currentLine?: CueLine;
    private currentSide: CanvasSide;

    // TODO: very messy code around these two props!!!
    private previouslyClickedDotId?: Id; // TODO: create ticket for clearing the code around this prop
    private previouslyHoveredDotId?: Id; // TODO: create ticket for clearing the code around this prop

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
        if (previouslyHovered) {
            super.invokeRemoveDot(previouslyHovered);
            this.previouslyHoveredDotId = undefined;
        }

        if (this.currentLine) {
            const position = this.currentLine.to;
            this.changeLine(position);
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
        this.changeDot(position);
        this.changeLine(position);
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.changeSide(position);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        this.changeSize(size);
    }

    private changeDot(position: Position): void {
        const currentlyHovered = this.gridCanvas.getDotByPosition(position);
        const previouslyHovered = this.gridCanvas.getDotById(this.previouslyHoveredDotId!);

        if (!currentlyHovered) {
            if (previouslyHovered) {
                super.invokeRemoveDot(previouslyHovered);
                this.previouslyHoveredDotId = undefined;
            }
        } else if (currentlyHovered.id !== previouslyHovered?.id) {
            if (previouslyHovered) {
                super.invokeRemoveDot(previouslyHovered);
                this.previouslyHoveredDotId = undefined;
            }
            this.hoverDot(currentlyHovered);
        }
    }

    private changeLine(position: Position): void {
        const previousClickedDot = this.gridCanvas.getDotById(this.previouslyClickedDotId!);

        if (!previousClickedDot) {
            return;
        }

        if (this.currentLine) {
            const id = this.currentLine.id;
            this.currentLine = this.createLine(previousClickedDot, position);
            this.currentLine.id = id;
            super.invokeMoveLine(this.currentLine);
        } else {
            this.currentLine = this.createLine(previousClickedDot, position);
            this.drawLine(this.currentLine);
        }
    }

    private changeSide(position: Position): void {
        const clickedDot = this.gridCanvas.getDotByPosition(position);
        if (clickedDot) {
            this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
            this.previouslyClickedDotId = clickedDot.id;
            if (this.currentLine) {
                this.invokeRemoveLine(this.currentLine);
                this.currentLine = undefined;
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

    private createLine(previousClickedDot: GridDot, currentMousePosition: Position): CueLine {
        const fromDot = this.converter.convertToCueDot(previousClickedDot, this.dotColor);

        const toDotId = this.ids.next();
        const toDot = { ...currentMousePosition, id: toDotId, radius: this.dotRadius, color: this.dotColor };

        const lineId = this.ids.next();
        const line = { id: lineId, from: fromDot, to: toDot, width: this.lineWidth, color: this.lineColor };

        return line;
    }

    private drawLine(line: CueLine): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeDrawLine(line);
        } else {
            super.invokeDrawDashLine(line);
        }
    }
}