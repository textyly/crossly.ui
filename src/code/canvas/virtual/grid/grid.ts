import { IGridCanvas } from "../types.js";
import { GridCanvasBase } from "./base.js";
import { GridThread, CanvasConfig } from "../../types.js";
import { IInputCanvas, MoveEvent } from "../../input/types.js";

export class GridCanvas extends GridCanvasBase implements IGridCanvas {
    private readonly inputCanvas: IInputCanvas;

    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config);
        this.inputCanvas = inputCanvas;
        this.subscribe();
    }

    protected override redraw(): void {
        // CPU, GPU, memory and GC intensive code!!!

        // 1. Do not divide this method in different methods
        const allRows = this.allDotsY;
        const allColumns = this.allDotsX;
        const dotSpacing = this.dotsSpacing;

        const bounds = this.bounds;
        const boundsX = bounds.x;
        const boundsY = bounds.y;
        const boundsWidth = bounds.width;
        const boundsHeight = bounds.height;

        const virtualBounds = this.virtualBounds;
        const virtualBoundsX = virtualBounds.x;
        const virtualBoundsY = virtualBounds.y;
        const virtualBoundsWidth = virtualBounds.width;
        const virtualBoundsHeight = virtualBounds.height;

        const dotRadius = this.dotRadius;
        const dotColor = this.dotColor;
        const threadWidth = this.threadWidth;
        const threadColor = this.threadColor;

        // 2. Do not touch `this` in the loops
        // 3. Do not touch nested props in the loops (such as this.virtualBounds.width)
        // 4. Do not create variables in the loops except for perf reasons
        // 5. Use as many if clauses as needed in order to limit the code execution and drawing

        // TODO: find only the visible dots to be drawn and all !!!
        let areThreadsXCalculated = false; // reduces threads number 
        const dotsX: Array<number> = [];
        const dotsY: Array<number> = [];
        const threadsX = new Array<GridThread>();
        const threadsY = new Array<GridThread>();

        for (let dotY = 0; dotY < allRows; dotY++) {
            // check wether the row is visible
            if (dotY % 2 === 0) {

                for (let dotX = 0; dotX < allColumns; dotX++) {

                    // check wether the column is visible
                    if (dotX % 2 === 0) {
                        const x = virtualBoundsX + (dotX * dotSpacing);

                        // check whether the dot is visible by `x`
                        if (x >= boundsX) {
                            if (x <= boundsWidth) {
                                const y = virtualBoundsY + (dotY * dotSpacing);

                                // check whether the dot is visible by `y`
                                if (y >= boundsY) {
                                    if (y <= boundsHeight) {
                                        // draw only visible dots!!!
                                        dotsX.push(x);
                                        dotsY.push(y);
                                    }
                                }

                                if (!areThreadsXCalculated) {
                                    // draw only visible columns!!!
                                    const from = { x, y: virtualBoundsY };
                                    const to = { x, y: virtualBoundsY + virtualBoundsHeight };
                                    threadsX.push({ from, to, width: threadWidth, color: threadColor });
                                }
                            }
                        }
                    }
                }

                areThreadsXCalculated = true;

                // check whether the dot is visible by `y`
                const y = virtualBoundsY + (dotY * dotSpacing);
                if (y >= boundsY) {
                    if (y <= boundsHeight) {
                        // draw only visible rows!!!
                        const from = { x: virtualBoundsX, y };
                        const to = { x: virtualBoundsX + virtualBoundsWidth, y }
                        threadsY.push({ from, to, width: threadWidth, color: threadColor });
                    }
                }
            }
        }

        super.invokeDrawThreads([...threadsX, ...threadsY]);
        super.invokeDrawDots(dotsX, dotsY, dotRadius, dotColor);
    }

    private subscribe(): void {
        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const moveUn = this.inputCanvas.onMove(this.handleMove.bind(this));
        super.registerUn(moveUn);
    }

    private handleZoomIn(): void {
        super.zoomIn();
    }

    private handleZoomOut(): void {
        super.zoomOut();
    }

    private handleMove(event: MoveEvent): void {
        const difference = event.difference;
        super.move(difference);
    }
}