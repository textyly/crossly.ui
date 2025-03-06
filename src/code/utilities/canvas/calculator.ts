import { Bounds } from "../../canvas/types.js";
import { Position } from "../../canvas/input/types.js";
import { DotIndex } from "../../canvas/virtual/types.js";

class CanvasCalculator {

    public inDrawingBounds(virtualBounds: Bounds, position: Position, dotsSpacing: number): boolean {
        const dotIndex = this.calculateDrawingIndex(virtualBounds, position, dotsSpacing);
        const calculatedX = virtualBounds.left + (dotIndex.indexX * dotsSpacing);
        const calculatedY = virtualBounds.top + (dotIndex.indexY * dotsSpacing);

        const inVirtualX = (calculatedX >= virtualBounds.left) && (calculatedX <= virtualBounds.left + virtualBounds.width);
        const inVirtualY = (calculatedY >= virtualBounds.top) && (calculatedY <= virtualBounds.top + virtualBounds.height);

        const isInVirtualBounds = inVirtualX && inVirtualY;

        return isInVirtualBounds;
    }

    public calculateDrawingIndex(virtualBounds: Bounds, position: Position, dotsSpacing: number): DotIndex {
        const closestX = (position.x - virtualBounds.left) / dotsSpacing;
        const closestY = (position.y - virtualBounds.top) / dotsSpacing;

        const indexX = Math.round(closestX);
        const indexY = Math.round(closestY);

        return { indexX, indexY };
    }

    public calculateDrawingPosition(virtualBounds: Bounds, index: DotIndex, dotsSpacing: number): Position {
        const x = this.calculateDrawingX(virtualBounds, index.indexX, dotsSpacing);
        const y = this.calculateDrawingY(virtualBounds, index.indexY, dotsSpacing);
        return { x, y };
    }

    public calculateDrawingX(virtualBounds: Bounds, indexX: number, dotsSpacing: number): number {
        const x = virtualBounds.left + (indexX * dotsSpacing);
        return x;
    }

    public calculateDrawingY(virtualBounds: Bounds, indexY: number, dotsSpacing: number): number {
        const y = virtualBounds.top + (indexY * dotsSpacing);
        return y;
    }

    public calculateMovingBounds(currentPosition: Position, bounds: Bounds, visibleBounds: Bounds, virtualBounds: Bounds): Bounds {
        const moveDownSpace = visibleBounds.height - currentPosition.y;
        const moveUpSpace = visibleBounds.height - moveDownSpace;
        const moveRightSpace = visibleBounds.width - currentPosition.x;
        const moveLeftSpace = visibleBounds.width - moveRightSpace;

        const suggestedTop = -1 * moveDownSpace;
        const top = Math.max(suggestedTop, virtualBounds.top);
        const topDiff = Math.abs(virtualBounds.top) - Math.abs(top);

        const suggestedHeight = -1 * top + (bounds.top + bounds.height + moveUpSpace);
        const height = Math.min(suggestedHeight, virtualBounds.height - topDiff);

        const suggestedLeft = -1 * moveRightSpace;
        const left = Math.max(suggestedLeft, virtualBounds.left);
        const leftDiff = Math.abs(virtualBounds.left) - Math.abs(left);

        const suggestedWidth = -1 * left + (bounds.left + bounds.width + moveLeftSpace);
        const width = Math.min(suggestedWidth, virtualBounds.width - leftDiff);

        const movingBounds = { left, top, width, height };
        return movingBounds;
    }

    public calculateVirtualBounds(virtualBounds: Bounds, allDotsX: number, allDotsY: number, dotsSpacing: number, differenceX: number = 0, differenceY: number = 0): Bounds {
        const left = virtualBounds.left + differenceX;
        const top = virtualBounds.top + differenceY;

        const width = (allDotsX - 1) * dotsSpacing;
        const height = (allDotsY - 1) * dotsSpacing;

        return { left, top, width, height };
    }

    public calculateDrawingBounds(virtualBounds: Bounds, visibleBounds: Bounds): Bounds {
        const drawingLeftTop = this.calculateDrawingLeftTop(virtualBounds, visibleBounds);
        const drawingWidth = this.calculateDrawingWidth(virtualBounds, visibleBounds);
        const drawingHeight = this.calculateDrawingHeight(virtualBounds, visibleBounds);

        const drawingBounds = {
            left: drawingLeftTop.x,
            top: drawingLeftTop.y,
            width: drawingWidth,
            height: drawingHeight
        };

        return drawingBounds;
    }

    public calculateDrawingLeftTop(virtualBounds: Bounds, visibleBounds: Bounds): Position {
        const visibleLeftTopX = virtualBounds.left < visibleBounds.left
            ? visibleBounds.left
            : Math.min(virtualBounds.left, (visibleBounds.left + visibleBounds.width));

        const visibleLeftTopY = virtualBounds.top < visibleBounds.top
            ? visibleBounds.top
            : Math.min(virtualBounds.top, (visibleBounds.top + visibleBounds.height));

        const visibleLeftTopDot = { x: visibleLeftTopX, y: visibleLeftTopY };
        return visibleLeftTopDot;
    }

    public calculateDrawingWidth(virtualBounds: Bounds, visibleBounds: Bounds): number {
        if (virtualBounds.left < visibleBounds.left) {
            const virtualWidth = virtualBounds.width - (Math.abs(virtualBounds.left) - Math.abs(visibleBounds.left));
            return Math.min(virtualWidth, visibleBounds.width);
        }

        if (virtualBounds.left > visibleBounds.left) {
            const visibleWidthOffset = visibleBounds.left + visibleBounds.width;
            const virtualWidthOffset = virtualBounds.left + virtualBounds.width;

            if (virtualWidthOffset <= visibleWidthOffset) {
                return virtualBounds.width;
            } else {
                return (visibleBounds.width - virtualBounds.left);
            }
        }

        return Math.min(virtualBounds.width, visibleBounds.width);
    }

    public calculateDrawingHeight(virtualBounds: Bounds, visibleBounds: Bounds): number {
        if (virtualBounds.top < visibleBounds.top) {
            const virtualHeight = virtualBounds.height - (Math.abs(virtualBounds.top) - Math.abs(visibleBounds.top));
            return Math.min(virtualHeight, visibleBounds.height);
        }

        if (virtualBounds.top > visibleBounds.top) {
            const visibleHeightOffset = visibleBounds.top + visibleBounds.height;
            const virtualHeightOffset = virtualBounds.top + virtualBounds.height;

            if (virtualHeightOffset <= visibleHeightOffset) {
                return virtualBounds.height;
            } else {
                return (visibleBounds.height - virtualBounds.top);
            }
        }

        return Math.min(virtualBounds.height, visibleBounds.height);
    }
}

export default new CanvasCalculator();