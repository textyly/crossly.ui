import { StitchCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IGridCanvas, IStitchCanvas, StitchCanvasConfig, StitchState } from "../types.js";
import { CanvasSide, Id, StitchLine, SizeChangeEvent, GridDot } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;
    private readonly converter: Converter;

    private lines: Array<StitchLine>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;

    private state!: StitchState;

    constructor(inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;
        this.converter = new Converter();

        this.currentSide = CanvasSide.Back;
        this.lines = [];

        this.subscribe();
    }

    public draw(config: Readonly<StitchCanvasConfig>): void {
        this.state = config;
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

        copy.forEach((line) => this.drawLine(line.from.id, line.to.id, this.state.lines.width.value, line.side, this.state.lines.color));

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
        const fromGridDot = this.gridCanvas.getDotById(fromId); // TODO: dot color!!!
        const toGridDot = this.gridCanvas.getDotById(toId); // TODO: dot color!!!

        const dots = this.ensureDots(fromGridDot, toGridDot);

        const line = this.converter.convertToStitchLine(dots.from, dots.to, width, side, color);

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
        this.state.dots.radius.value += this.state.dots.radius.zoomStep;
        this.state.lines.width.value += this.state.lines.width.zoomStep;
        this.redraw();
    }

    private handleZoomOut(): void {
        this.state.dots.radius.value -= this.state.dots.radius.zoomStep;
        this.state.lines.width.value -= this.state.lines.width.zoomStep;
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
                this.drawLine(this.previousClickedDotId, currentlyClickedDot.id, this.state.lines.width.value, this.currentSide, this.state.lines.color);
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