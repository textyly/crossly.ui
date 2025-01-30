import { GridDot } from "../../types.js";
import { IDotMatcher } from "../types.js";
import { Position } from "../../input/types.js";

export class DotMatcher implements IDotMatcher {
    public match(dot: GridDot, position: Position, dotMatchDistance: number): boolean {
        const distance = Math.sqrt((position.x - dot.x) ** 2 + (position.y - dot.y) ** 2);
        const isInside = distance <= dotMatchDistance;
        return isInside;
    }
} 