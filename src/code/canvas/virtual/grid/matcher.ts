import { GridDot } from "../../types.js";
import { IDotMatcher } from "../types.js";
import { Position } from "../../input/types.js";

export class DotMatcher implements IDotMatcher {
    public match(dotX: number, dotY: number, position: Position, dotMatchDistance: number): boolean {
        const distance = Math.sqrt((position.x - dotX) ** 2 + (position.y - dotY) ** 2);
        const isInside = distance <= dotMatchDistance;
        return isInside;
    }
} 