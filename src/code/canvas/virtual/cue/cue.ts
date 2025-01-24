import { CueCanvasBase } from "./base.js";
import { Converter } from "../../../utilities/converter.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CueCanvasConfig, ICueCanvas, IGridCanvas } from "../types.js";
import { CanvasSide, Id, CueLine, SizeChangeEvent, GridDot } from "../../types.js";
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

    private cueDotColor!: string;
    private cueDotRadius!: number;
    private cueDotRadiusZoomStep!: number;
    private cueLineColor!: string;
    private cueLineWidth!: number;
    private cueLineWidthZoomStep!: number;

    constructor(config: CueCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);
        this.setConfig(super.config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.ids = new IdGenerator();
        this.currentSide = CanvasSide.Back;
        this.converter = new Converter();

        this.subscribe();
    }

    public get dotColor(): string {
        return this.cueDotColor;
    }

    public set dotColor(color: string) {
        if (this.cueDotColor !== color) {
            this.cueDotColor = color;
            this.draw();
        }
    }

    public get dotRadius(): number {
        return this.cueDotRadius;
    }

    public set dotRadius(radius: number) {
        if (this.cueDotRadius !== radius) {
            this.cueDotRadius = radius;
            this.draw();
        }
    }

    public get lineColor(): string {
        return this.cueLineColor;
    }

    public set lineColor(color: string) {
        if (this.cueLineColor !== color) {
            this.cueLineColor = color;
            this.draw();
        }
    }

    public get lineWidth(): number {
        return this.cueLineWidth;
    }

    public set lineWidth(width: number) {
        if (this.cueLineWidth !== width) {
            this.cueLineWidth = width;
            this.draw();
        }
    }

    public override draw(): void {
        this.ids.reset();

        if (this.previousHoveredDotId) {
            this.unhoverDot(this.previousHoveredDotId);
        }

        if (this.currentLine) {
            const position = this.currentLine.to;
            this.changeLine(position);
        }
    }

    private setConfig(config: CueCanvasConfig): void {
        const dotConfig = config.dot;
        this.cueDotColor = dotConfig.color;
        this.cueDotRadius = dotConfig.radius.value;
        this.cueDotRadiusZoomStep = dotConfig.radius.zoomStep;

        const lineConfig = config.line;
        this.cueLineColor = lineConfig.color;
        this.cueLineWidth = lineConfig.width.value;
        this.cueLineWidthZoomStep = lineConfig.width.zoomStep;
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
        this.dotRadius += this.cueDotRadiusZoomStep;
        this.lineWidth += this.cueLineWidthZoomStep;
    }

    private handleZoomOut(): void {
        this.dotRadius -= this.cueDotRadiusZoomStep;
        this.lineWidth -= this.cueLineWidthZoomStep;
    }

    private handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        this.changeHoveredDot(position);
        this.changeLine(position);
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;

        const previousClickedDot = this.gridCanvas.getDotByPosition(position);
        if (previousClickedDot) {
            this.changeSide();
            this.previousClickedDotId = previousClickedDot.id;
        }
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
    }

    private changeHoveredDot(position: Position): void {
        const hoveredDot = this.gridCanvas.getDotByPosition(position);

        if (hoveredDot) {
            if ((hoveredDot.id !== this.previousHoveredDotId)) {
                if (this.previousHoveredDotId) {
                    this.unhoverDot(this.previousHoveredDotId);
                }

                this.previousHoveredDotId = hoveredDot.id;
                const hovered = { id: hoveredDot.id, x: hoveredDot.x, y: hoveredDot.y, radius: this.dotRadius, color: this.dotColor };
                super.invokeHoverDot(hovered);
            }
        } else if (this.previousHoveredDotId) {
            this.unhoverDot(this.previousHoveredDotId);
        }
    }

    private unhoverDot(previousHoveredDotId: string): void {
        const previousHoveredDot = this.gridCanvas.getDotById(previousHoveredDotId);
        if (previousHoveredDot) {
            super.invokeUnhoverDot(previousHoveredDot);
        }
        this.previousHoveredDotId = undefined;
    }

    private changeLine(position: Position): void {
        const previousClickedDot = this.gridCanvas.getDotById(this.previousClickedDotId!)!;
        if (previousClickedDot) {
            if (this.currentLine) {
                this.removeLine(this.currentLine);
                this.currentLine = undefined;
            }
            this.currentLine = this.createLine(previousClickedDot, position);
            this.drawLine(this.currentLine);
        }
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
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
            super.invokeDrawFrontLine(line);
        } else {
            super.invokeDrawBackLine(line);
        }
    }


    private removeLine(line: CueLine): void {
        if (this.currentSide === CanvasSide.Front) {
            super.invokeRemoveFrontLine(line);
        } else {
            super.invokeRemoveBackLine(line);
        }
    }
}