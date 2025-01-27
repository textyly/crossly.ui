import { StitchCanvasBase } from "./base.js";
import { IGridCanvas, IStitchCanvas } from "../types.js";
import { DotsUtility } from "../../../utilities/dots.js";
import { Converter } from "../../../utilities/converter.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";
import { CanvasSide, Id, StitchThread, SizeChangeEvent, GridDot, Size, StitchCanvasConfig } from "../../types.js";

export class StitchCanvas extends StitchCanvasBase implements IStitchCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly gridCanvas: IGridCanvas;
    private readonly converter: Converter;
    private readonly dotsUtility: DotsUtility<GridDot>;

    private threads: Array<StitchThread>;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;

    constructor(config: StitchCanvasConfig, inputCanvas: IInputCanvas, gridCanvas: IGridCanvas) {
        super(config);

        this.inputCanvas = inputCanvas;
        this.gridCanvas = gridCanvas;

        this.converter = new Converter();
        this.dotsUtility = new DotsUtility();
        this.currentSide = CanvasSide.Back;
        this.threads = [];

        this.subscribe();
    }

    public draw(): void {
        this.invokeRedraw();
        this.redraw();
    }

    public override dispose(): void {
        this.threads = [];
        super.dispose();
    }

    private redraw(): void {
        this.drawThreads();
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseButtonClick.bind(this));
        super.registerUn(mouseLeftButtonDownUn);

        const mouseLeftButtonDownUp = this.inputCanvas.onMouseLeftButtonUp(this.handleMouseButtonClick.bind(this));
        super.registerUn(mouseLeftButtonDownUp);

        const sizeChangeUn = this.gridCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);
    }

    private handleZoomIn(): void {
        super.zoomIn();
    }

    private handleZoomOut(): void {
        super.zoomOut();
    }

    private handleMouseButtonClick(event: MouseLeftButtonDownEvent): void {
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

        if (currentlyClickedDot.id === this.previousClickedDotId) {
            return;
        }

        if (this.previousClickedDotId) {
            const recreated = this.createThread(this.previousClickedDotId, currentlyClickedDot.id, this.threadWidth, this.currentSide, this.threadColor);
            this.threads.push(recreated);
            this.drawThread(recreated);
        }

        this.previousClickedDotId = currentlyClickedDot.id;
        this.changeSide();
    }

    private changeSize(size: Size): void {
        super.size = size;
        this.draw();
    }

    private drawThreads(): Array<StitchThread> {
        const copy = this.threads;
        this.threads = [];

        copy.forEach((thread) => {
            const recreated = this.createThread(thread.from.id, thread.to.id, this.threadWidth, thread.side, this.threadColor);
            this.threads.push(recreated);
        });

        const frontThreads = this.threads.filter((thread) => thread.side === CanvasSide.Front);
        super.invokeDrawFrontThreads(frontThreads);

        const backThreads = this.threads.filter((thread) => thread.side === CanvasSide.Back);
        super.invokeDrawBackThreads(backThreads);

        return this.threads;
    }

    private drawThread(thread: StitchThread): void {
        if (thread.side == CanvasSide.Front) {
            super.invokeDrawFrontThreads([thread]);
        } else {
            super.invokeDrawBackThreads([thread]);
        }
    }

    private createThread(fromId: string, toId: string, width: number, side: CanvasSide, color: string): StitchThread {
        const fromGridDot = this.gridCanvas.getDotById(fromId);
        const toGridDot = this.gridCanvas.getDotById(toId);

        const dots = this.dotsUtility.ensureDots(fromGridDot, toGridDot);

        const from = this.converter.convertToStitchDot(dots.from, this.dotColor, side);
        const to = this.converter.convertToStitchDot(dots.to, this.dotColor, side);

        const thread = { from: from, to: to, width, side, color };
        return thread;
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }
}