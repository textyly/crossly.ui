import { FabricCanvasBase } from "./base.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricThread, CanvasConfig } from "../../types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
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
        const threadsX = new Array<FabricThread>();
        const threadsY = new Array<FabricThread>();

        const x = virtualBoundsX < bounds.x ? bounds.x : Math.min(virtualBoundsX, boundsX + boundsWidth);
        const y = virtualBoundsY < bounds.y ? bounds.y : Math.min(virtualBoundsY, boundsY + boundsHeight);

        const width = virtualBoundsX < bounds.x
            ? (virtualBoundsWidth - (Math.abs(virtualBoundsX) + Math.abs(bounds.x)))
            : (virtualBoundsX + virtualBoundsWidth) <= (bounds.x + boundsWidth)
                ? virtualBoundsWidth
                : (boundsWidth - virtualBoundsX);

        const height = virtualBoundsY < bounds.y
            ? (virtualBoundsHeight - (Math.abs(virtualBoundsY) + Math.abs(bounds.y)))
            : (virtualBoundsY + virtualBoundsHeight) <= (bounds.y + boundsHeight)
                ? virtualBoundsHeight
                : (boundsHeight - virtualBoundsY);

        // console.log(`x: ${x}, y: ${y}, width: ${width}, height: ${height}`);

        const dotIndex = super.getDotIndex({ x, y });
        const newPos = this.getDotPosition(dotIndex);

        const widthIndex = super.getDotIndex({ x: newPos.x + width, y: newPos.y });
        const heightIndex = super.getDotIndex({ x: newPos.x, y: newPos.y + height });

        // console.log(`dotIndex: ${JSON.stringify(dotIndex)}, widthIndex: ${JSON.stringify(widthIndex)}, heightIndex: ${JSON.stringify(heightIndex)}`);

        for (let dotY = dotIndex.indexY; dotY <= heightIndex.indexY; dotY++) {
            const isRowVisible = dotY % 2 === 0;

            if (isRowVisible) {
                for (let dotX = dotIndex.indexX; dotX <= widthIndex.indexX; dotX++) {
                    const isColumnVisible = dotX % 2 === 0;

                    if (isColumnVisible) {
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
}