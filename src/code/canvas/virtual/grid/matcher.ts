import { Dot } from "../../types.js";
import { IDotMatcher } from "../types.js";
import { Position } from "../../input/types.js";

export class DotMatcher implements IDotMatcher {
    public match(dot: Dot, mouse: Position): boolean {
        const distance = Math.sqrt((mouse.x - dot.x) ** 2 + (mouse.y - dot.y) ** 2);
        const isInside = distance <= (dot.radius * 2);
        return isInside;
    }
}