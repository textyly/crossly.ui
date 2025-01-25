import { StitchCanvasBase } from "./base.js";
import { IGridCanvas, IStitchCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { Converter } from "../../../utilities/converter.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, StitchLine, SizeChangeEvent, GridDot, Size, StitchCanvasConfig } from "../../types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;
    private readonly converter: Converter;
    private readonly dotsUtility: DotsUtility<GridDot>;

    private lines: Array<StitchLine>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id; // TODO: create ticket, very messy code around this prop

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.converter = new Converter();
        this.dotsUtility = new DotsUtility();
        this.currentSide = CanvasSide.Back;
        this.lines = [];

        this.subscribe();
    }

    public draw(): void {
        this.invokeRedraw();
        this.redraw();
    }

    public override dispose(): void {
        this.lines = [];
        super.dispose();
    }

    private redraw(): void {
        this.drawLines();
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

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

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.handleDotClick(position);
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        this.changeSize(size);
    }

    private handleDotClick(position: Position): void {
        const currentlyClickedDot = this.gridCanvas.getDotByPosition(position);
        if (!currentlyClickedDot) {
            return;
        }

        if (this.previousClickedDotId) {
            const recreated = this.createLine(this.previousClickedDotId, currentlyClickedDot.id, this.lineWidth, this.currentSide, this.lineColor);
            this.drawLine(recreated);
        }

        this.previousClickedDotId = currentlyClickedDot.id;
        this.changeSide();
    }

    private changeSize(size: Size): void {
        super.size = size;
        this.draw();
    }

    private drawLines(): Array<StitchLine> {
        const copy = this.lines;
        this.lines = [];

        copy.forEach((line) => {
            const recreated = this.createLine(line.from.id, line.to.id, this.lineWidth, line.side, this.lineColor);
            this.drawLine(recreated);
        });

        return this.lines;
    }

    private drawLine(line: StitchLine): void {
        this.lines.push(line);

        if (line.side == CanvasSide.Front) {
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

        const dots = this.dotsUtility.ensureDots(fromGridDot, toGridDot);

        const from = this.converter.convertToStitchDot(dots.from, this.dotColor, side);
        const to = this.converter.convertToStitchDot(dots.to, this.dotColor, side);

        const line = { from: from, to: to, width, side, color };
        return line;
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}