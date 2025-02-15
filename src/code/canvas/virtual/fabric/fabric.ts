import { FabricCanvasBase } from "./base.js";
import { IInputCanvas } from "../../input/types.js";
import { FabricThread, CanvasConfig } from "../../types.js";

export class FabricCanvas extends FabricCanvasBase {
    constructor(config: CanvasConfig, inputCanvas: IInputCanvas) {
        super(config, inputCanvas);
    }

    protected override redraw(): void {
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

        let areThreadsXCalculated = false; // reduces threads number 
        const dotsX: Array<number> = [];
        const dotsY: Array<number> = [];
        const threadsX = new Array<FabricThread>();
        const threadsY = new Array<FabricThread>();

        const x = virtualBoundsX < bounds.x ? bounds.x : Math.min(virtualBoundsX, boundsX + boundsWidth);
        const y = virtualBoundsY < bounds.y ? bounds.y : Math.min(virtualBoundsY, boundsY + boundsHeight);

        // if-else, new method
        const width = virtualBoundsX < bounds.x
            ? (virtualBoundsWidth - (Math.abs(virtualBoundsX) + Math.abs(bounds.x))) > boundsWidth ? boundsWidth : (virtualBoundsWidth - (Math.abs(virtualBoundsX) + Math.abs(bounds.x)))
            : (virtualBoundsX + virtualBoundsWidth) <= (bounds.x + boundsWidth)
                ? virtualBoundsWidth
                : (boundsWidth - virtualBoundsX);

        // if-else, new method
        const height = virtualBoundsY < bounds.y
            ? (virtualBoundsHeight - (Math.abs(virtualBoundsY) + Math.abs(bounds.y))) > boundsHeight ? boundsHeight : (virtualBoundsHeight - (Math.abs(virtualBoundsY) + Math.abs(bounds.y)))
            : (virtualBoundsY + virtualBoundsHeight) <= (bounds.y + boundsHeight)
                ? virtualBoundsHeight
                : (boundsHeight - virtualBoundsY);

        // console.log(`x: ${x}, y: ${y}, width: ${width}, height: ${height}`);

        const dotIndex = super.getDotIndex({ x, y });
        const newPos = this.getDotPosition(dotIndex);

        const widthIndex = super.getDotIndex({ x: newPos.x + width, y: newPos.y });
        const heightIndex = super.getDotIndex({ x: newPos.x, y: newPos.y + height });

        // console.log(`dotIndex: ${JSON.stringify(dotIndex)}, widthIndex: ${JSON.stringify(widthIndex)}, heightIndex: ${JSON.stringify(heightIndex)}`);

        const dotIndexX = dotIndex.indexX % 2 === 0 ? dotIndex.indexX : ++dotIndex.indexX;
        const dotIndexY = dotIndex.indexY % 2 === 0 ? dotIndex.indexY : ++dotIndex.indexY;

        console.log(`dotIndexX: ${dotIndexX} - heightIndex: ${widthIndex}`);
        console.log(`dotIndexY: ${dotIndexY} - heightIndex: ${widthIndex}`);

        for (let dotY = dotIndexY; dotY <= heightIndex.indexY; dotY += 2) {
            for (let dotX = dotIndexX; dotX <= widthIndex.indexX; dotX += 2) {
                const dotPosition = super.getDotPosition({ indexX: dotX, indexY: dotY });
                dotsX.push(dotPosition.x);
                dotsY.push(dotPosition.y);

                if (!areThreadsXCalculated) {
                    const from = { x: dotPosition.x, y: virtualBoundsY };
                    const to = { x: dotPosition.x, y: virtualBoundsY + virtualBoundsHeight };
                    threadsX.push({ from, to, width: threadWidth, color: threadColor });
                }
            }

            areThreadsXCalculated = true;

            const dotYPosition = super.getDotYPosition(dotY);
            const from = { x: virtualBoundsX, y: dotYPosition };
            const to = { x: virtualBoundsX + virtualBoundsWidth, y: dotYPosition }
            threadsY.push({ from, to, width: threadWidth, color: threadColor });
        }

        super.invokeDrawThreads([...threadsX, ...threadsY]);
        super.invokeDrawDots(dotsX, dotsY, dotRadius, dotColor);
    }
}