import { CueCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CueCanvasConfig, CueState, ICueCanvas, IGridCanvas } from "../types.js";
import { CanvasSide, Visibility, Id, CueLine, SizeChangeEvent, CueDot } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, MouseMoveEvent, Position } from "../../input/types.js";

export class CueCanvas extends CueCanvasBase implements ICueCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private readonly ids: IdGenerator;
    private readonly converter: Converter;

    private currentLine?: CueLine;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;
    private previousHoveredDotId?: Id;

    private state!: CueState;

    constructor(config: CueCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.state = super.config;
        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.ids = new IdGenerator();
        this.converter = new Converter();

        this.currentSide = CanvasSide.Back;

        this.subscribe();
    }

    public override draw(): void {
        this.ids.reset();

        if (this.previousHoveredDotId) {
            this.handleUnhoverDot(this.previousHoveredDotId);
        }

        if (this.currentLine) {
            const position = this.currentLine.to;
            this.handleLineChange(position);
        }
    }

    private subscribe(): void {
        const sizeChangeUn = this.gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseMoveUn = this.inputCanvas.onMouseMove(this.handleMouseMove.bind(this));
        super.registerUn(mouseMoveUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);
    }

    private handleZoomIn(): void {
        this.state.dot.radius.value += this.state.dot.radius.zoomStep;
        this.state.line.width.value += this.state.line.width.zoomStep;
        this.draw();
    }

    private handleZoomOut(): void {
        this.state.dot.radius.value -= this.state.dot.radius.zoomStep;
        this.state.line.width.value -= this.state.line.width.zoomStep;
        this.draw();
    }

    private handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        this.handleDotChange(position);
        this.handleLineChange(position);
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;

        const previousClickedDot = this.gridCanvas.getDotByPosition(position);
        if (previousClickedDot) {
            this.changeSide();
            this.previousClickedDotId = previousClickedDot.id;
        }
    }

    private handleDotChange(position: Position): void {
        const hovered = this.gridCanvas.getDotByPosition(position);

        if (hovered) {
            if ((hovered.id !== this.previousHoveredDotId)) {
                if (this.previousHoveredDotId) {
                    this.handleUnhoverDot(this.previousHoveredDotId);
                }

                this.previousHoveredDotId = hovered.id;
                const hoveredDot = { id: hovered.id, x: hovered.x, y: hovered.y, radius: this.state.dot.radius.value, visibility: Visibility.Visible, color: this.state.dot.color };
                super.invokeHoverDot(hoveredDot);
            }
        } else if (this.previousHoveredDotId) {
            this.handleUnhoverDot(this.previousHoveredDotId);
        }
    }

    private handleUnhoverDot(previousHoveredDotId: string): void {
        const previousHoveredDot = this.gridCanvas.getDotById(previousHoveredDotId);
        if (previousHoveredDot) {
            super.invokeUnhoverDot(previousHoveredDot);
        }
        this.previousHoveredDotId = undefined;
    }

    private handleLineChange(position: Position): void {
        const previousClickedDot = this.gridCanvas.getDotById(this.previousClickedDotId!)!;

        if (previousClickedDot) {
            if (this.currentLine) {
                this.removeLine(this.currentLine);
            }
            this.drawLine(previousClickedDot, position);
        }
    }

    private drawLine(previousClickedDot: CueDot, currentMousePosition: Position): void {
        const toDotId = this.ids.next();
        const toDot = { ...currentMousePosition, id: toDotId, radius: this.state.dot.radius.value, side: this.currentSide, color: this.state.dot.color };

        const lineId = this.ids.next();
        const fromDot = this.converter.convertToStitchDot(previousClickedDot, this.state.dot.color, this.currentSide);

        this.currentLine = { id: lineId, from: fromDot, to: toDot, width: this.state.line.width.value, side: this.currentSide, color: this.state.line.color };

        super.invokeDrawLine(this.currentLine);
    }

    private removeLine(line: CueLine) {
        super.invokeRemoveLine(line);
        this.currentLine = undefined;
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
    }
}