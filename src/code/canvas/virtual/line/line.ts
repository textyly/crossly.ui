import { CanvasSide, Id, ILineVirtualCanvas, Line } from "../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, Position } from "../../input/types.js";
import { DotVirtualCanvas } from "../dot/dot.js";
import { LineVirtualCanvasBase } from "./base.js";
import { Size } from "../../types.js";

export class LineVirtualCanvas extends LineVirtualCanvasBase implements ILineVirtualCanvas {
    private readonly dotVirtualCanvas: DotVirtualCanvas;
    private readonly inputCanvas: IInputCanvas;

    private lines: Array<Line>;

    private clicked?: Id;
    private side: CanvasSide;

    constructor(dotVirtualCanvas: DotVirtualCanvas, inputCanvas: IInputCanvas) {
        super();
        this.dotVirtualCanvas = dotVirtualCanvas;
        this.inputCanvas = inputCanvas;
        this.side = CanvasSide.Default;
        this.lines = [];
    }

    public override initialize(): void {
        super.initialize();

        const sizeChangeUn = this.dotVirtualCanvas.onSizeChange(this.handleDotVirtualCanvasSizeChange.bind(this));
        super.registerUn(sizeChangeUn);

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);
    }

    public draw(): void {
        this.lines = this.createLines();

        this.lines.forEach((line) => {
            super.invokeDrawLine(line);
        });
    }

    private handleDotVirtualCanvasSizeChange(size: Size): void {
        super.size = size;
    }

    private handleZoomIn(): void {
        this.draw();
    }

    private handleZoomOut(): void {
        this.draw();
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.handleDotClick(position);
    }

    private handleDotClick(position: Position): void {
        const clicked = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
        if (clicked) {
            if (!this.clicked) {
                this.side = CanvasSide.Front;
            } else {
                const previous = this.dotVirtualCanvas.getDotById(this.clicked!)!;
                const line: Line = { from: previous, to: clicked, side: this.side };
                this.handleDrawLine(line);
                this.side = this.side === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
            }
            this.clicked = clicked.id;
        }
    }

    private handleDrawLine(line: Line): void {
        this.lines.push(line);
        super.invokeDrawLine(line);
    }

    private createLines(): Array<Line> {
        const lines = new Array<Line>();

        this.lines.forEach((line) => {
            const from = this.dotVirtualCanvas.getDotById(line.from.id)!; // TODO: what if undefined ???
            const to = this.dotVirtualCanvas.getDotById(line.to.id)!; // TODO: what if undefined ???
            const l = { from, to, side: line.side };
            lines.push(l);
        });

        return lines;
    }
}