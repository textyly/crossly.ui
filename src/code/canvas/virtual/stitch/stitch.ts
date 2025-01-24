import { StitchCanvasBase } from "./base.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { Converter } from "../../../utilities/converter.js";
import { IGridCanvas, IStitchCanvas, StitchCanvasConfig } from "../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, StitchLine, SizeChangeEvent, GridDot, Size } from "../../types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;
    private readonly converter: Converter;
    private readonly dotsUtility: DotsUtility<GridDot>;

    private lines: Array<StitchLine>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id; // TODO: create ticket, very messy code around this prop

    private stitchDotColor!: string;
    private stitchDotRadius!: number;
    private stitchDotRadiusZoomStep!: number;
    private stitchLineColor!: string;
    private stitchLineWidth!: number;
    private stitchLineWidthZoomStep!: number;

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.converter = new Converter();
        this.dotsUtility = new DotsUtility();
        this.currentSide = CanvasSide.Back;
        this.lines = [];

        this.setConfig(super.config);
        this.subscribe();
    }

    public get dotColor(): string {
        return this.stitchDotColor;
    }

    public set dotColor(color: string) {
        if (this.stitchDotColor !== color) {
            this.stitchDotColor = color;
            this.draw();
        }
    }

    public get dotRadius(): number {
        return this.stitchDotRadius;
    }

    public set dotRadius(radius: number) {
        if (this.stitchDotRadius !== radius) {
            this.stitchDotRadius = radius;
            this.draw();
        }
    }

    public get lineColor(): string {
        return this.stitchLineColor;
    }

    public set lineColor(color: string) {
        if (this.stitchLineColor !== color) {
            this.stitchLineColor = color;
            this.draw();
        }
    }

    public get lineWidth(): number {
        return this.stitchLineWidth;
    }

    public set lineWidth(width: number) {
        if (this.stitchLineWidth !== width) {
            this.stitchLineWidth = width;
            this.draw();
        }
    }

    public draw(): void {
        this.drawLines();
    }

    public override dispose(): void {
        this.lines = [];
        super.dispose();
    }

    private setConfig(config: StitchCanvasConfig): void {
        const dotConfig = config.dot;
        this.stitchDotColor = dotConfig.color;
        this.stitchDotRadius = dotConfig.radius.value;
        this.stitchDotRadiusZoomStep = dotConfig.radius.zoomStep;

        const lineConfig = config.line;
        this.stitchLineColor = lineConfig.color;
        this.stitchLineWidth = lineConfig.width.value;
        this.stitchLineWidthZoomStep = lineConfig.width.zoomStep;
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
        this.zoomIn();
    }

    private handleZoomOut(): void {
        this.zoomOut();
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

    private zoomIn(): void {
        this.dotRadius += this.stitchDotRadiusZoomStep;
        this.lineWidth += this.stitchLineWidthZoomStep;
        this.draw();
    }

    private zoomOut(): void {
        this.dotRadius -= this.stitchDotRadiusZoomStep;
        this.lineWidth -= this.stitchLineWidthZoomStep;
        this.draw();
    }

    private changeSize(size: Size): void {
        super.size = size;
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