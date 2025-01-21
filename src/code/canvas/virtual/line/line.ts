import { LineVirtualCanvasBase } from "./base.js";
import { IDotVirtualCanvas, ILineVirtualCanvas } from "../types.js";
import { CanvasSide, Dot, Id, Line, SizeChangeEvent } from "../../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";

export class LineVirtualCanvas extends LineVirtualCanvasBase implements ILineVirtualCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotVirtualCanvas: IDotVirtualCanvas;

    private lines: Array<Line>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;

    constructor(inputCanvas: IInputCanvas, dotVirtualCanvas: IDotVirtualCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotVirtualCanvas = dotVirtualCanvas;

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
        const recreated = this.recreateLine(fromId, toId, side);
        this.lines.push(recreated);

        if (side === CanvasSide.Front) {
            super.invokeDrawLine(recreated);
        }
    }

    private recreateLine(fromId: string, toId: string, side: CanvasSide): Line {
        const from = this.dotVirtualCanvas.getDotById(fromId);
        const to = this.dotVirtualCanvas.getDotById(toId);

        const recreated = this.ensureLine(from, to, side);
        return recreated;
    }

    private ensureLine(from: Dot | undefined, to: Dot | undefined, side: CanvasSide): Line {
        if (!from) {
            throw new Error("`from` must be defined.");
        }

        if (!to) {
            throw new Error("`to` must be defined.");
        }

        return { from, to, side };
    }

    private subscribe(): void {
        const sizeChangeUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
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
        const currentlyClickedDot = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
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