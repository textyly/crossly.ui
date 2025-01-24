import { StitchCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IGridCanvas, StitchCanvasConfig, StitchState } from "../types.js";
import { CanvasSide, Id, StitchLine, SizeChangeEvent, GridDot } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;
    private readonly converter: Converter;

    private lines: Array<StitchLine>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;

    private state!: StitchState;

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.state = super.configuration;
        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.converter = new Converter();
        this.currentSide = CanvasSide.Back;
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

    private redrawLines(): Array<StitchLine> {
        const copy = this.lines;
        this.lines = [];

        copy.forEach((line) => this.drawLine(line.from.id, line.to.id, this.state.line.width.value, line.side, this.state.line.color));

        return this.lines;
    }

    private drawLine(fromId: string, toId: string, width: number, side: CanvasSide, color: string): void {
        const line = this.createLine(fromId, toId, width, side, color);
        this.lines.push(line);

        if (side == CanvasSide.Front) {
            this.drawFrontLine(line);
        } else {
            this.drawBackLine(line);
        }
    }

    private drawFrontLine(line: StitchLine): void {
        super.invokeDrawFrontDot(line.from);
        super.invokeDrawFrontDot(line.to);
        super.invokeDrawFrontLine(line);
    }

    private drawBackLine(line: StitchLine): void {
        super.invokeDrawBackDot(line.from);
        super.invokeDrawBackDot(line.to);
        super.invokeDrawBackLine(line);
    }

    private createLine(fromId: string, toId: string, width: number, side: CanvasSide, color: string): StitchLine {
        const fromGridDot = this.gridCanvas.getDotById(fromId);
        const toGridDot = this.gridCanvas.getDotById(toId);

        const dots = this.ensureDots(fromGridDot, toGridDot);
        const fromStitchDot = this.converter.convertToStitchDot(dots.from, this.state.dot.color, side);
        const toStitchDot = this.converter.convertToStitchDot(dots.to, this.state.dot.color, side);

        const line = { from: fromStitchDot, to: toStitchDot, width, side, color };

        return line;
    }

    private ensureDots(from: GridDot | undefined, to: GridDot | undefined): { from: GridDot, to: GridDot } {
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
        this.state.dot.radius.value += this.state.dot.radius.zoomStep;
        this.state.line.width.value += this.state.line.width.zoomStep;
        this.redraw();
    }

    private handleZoomOut(): void {
        this.state.dot.radius.value -= this.state.dot.radius.zoomStep;
        this.state.line.width.value -= this.state.line.width.zoomStep;
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
                this.drawLine(this.previousClickedDotId, currentlyClickedDot.id, this.state.line.width.value, this.currentSide, this.state.line.color);
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