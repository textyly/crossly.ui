import { Canvas } from "../../base.js";
import { RasterCanvas } from "../../html/raster.js";
import {
    Line,
    DrawDotEvent,
    DrawLineEvent,
    IVirtualCanvas
} from "../../virtual/types.js";

export abstract class DotCanvas extends Canvas {
    protected readonly rasterCanvas: RasterCanvas;
    protected readonly virtualCanvas: IVirtualCanvas;

    constructor(rasterCanvas: RasterCanvas, virtualCanvas: IVirtualCanvas) {
        super(virtualCanvas.size.width, virtualCanvas.size.height);

        this.rasterCanvas = rasterCanvas;
        this.virtualCanvas = virtualCanvas;
    }

    override initializeCore(): void {
        const redrawUn = this.virtualCanvas.onRedraw(this.handleRedraw.bind(this));
        super.registerUn(redrawUn);

        const drawGridUn = this.virtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawGridUn);

        const drawLineUn = this.virtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);
    }

    override disposeCore(): void {
        // base class will unsubscribe handleDrawGrid and handleDrawLine
    }

    abstract drawLine(line: Line): void;

    private handleRedraw(): void {
        this.rasterCanvas.clear();
    }

    private handleDrawDot(event: DrawDotEvent): void {
        const dot = event.dot;
        this.rasterCanvas.drawDot(dot);
    }

    private handleDrawLine(event: DrawLineEvent): void {
        const line = event.line;
        this.drawLine(line);
    }
}