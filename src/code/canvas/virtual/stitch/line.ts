import { StitchCanvasBase } from "./base.js";
import { IGridCanvas, IStitchCanvas } from "../types.js";
import { CanvasSide, Dot, Id, Line, SizeChangeEvent } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;

    private lines: Array<Line>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;

    constructor(inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.currentSide = CanvasSide.Default;
        this.lines = [];

        this.subscribe();
    }

    public draw(): void {
        this.redraw();
    }

    public override dispose(): void {
        this.lines = [];
        super.dispose();
    }

    private redraw(): void {
        this.redrawLines();
    }

    private redrawLines(): Array<Line> {
        const copy = this.lines;
        this.lines = [];

        copy.forEach((line) => this.drawLine(line.from.id, line.to.id, line.side));

        return this.lines;
    }

    private drawLine(fromId: string, toId: string, side: CanvasSide): void {
        const recreated = this.createLine(fromId, toId, side);
        this.lines.push(recreated);

        if (side === CanvasSide.Front) {
            super.invokeDrawDot(recreated.from);
            super.invokeDrawDot(recreated.to);
            super.invokeDrawLine(recreated);
        }
    }

    private createLine(fromId: string, toId: string, side: CanvasSide): Line {
        const from = this.gridCanvas.getDotById(fromId);
        const to = this.gridCanvas.getDotById(toId);

        const dots = this.ensureDots(from, to);
        const line = { from: dots.from, to: dots.to, width: dots.to.radius * 2, side };
        return line;
    }

    private ensureDots(from: Dot | undefined, to: Dot | undefined): { from: Dot, to: Dot } {
        if (!from) {
            throw new Error("`from` must be defined.");
        }

        if (!to) {
            throw new Error("`to` must be defined.");
        }

        return { from, to };
    }

    private subscribe(): void {
        const sizeChangeUn = this.gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);
    }

    private handleZoomIn(): void {
        this.redraw();
    }

    private handleZoomOut(): void {
        this.redraw();
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.handleDotClick(position);
    }

    private handleDotClick(position: Position): void {
        const currentlyClickedDot = this.gridCanvas.getDotByPosition(position);
        if (currentlyClickedDot) {

            if (this.previousClickedDotId) {
                this.drawLine(this.previousClickedDotId, currentlyClickedDot.id, this.currentSide);
            }

            this.previousClickedDotId = currentlyClickedDot.id;
            this.changeSide();
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
    }
}