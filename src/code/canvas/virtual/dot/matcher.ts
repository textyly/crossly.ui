import { IDotMatcher } from "../types.js";

export class DotMatcher implements IDotMatcher {
    public match(mouseX: number, mouseY: number, dotX: number, dotY: number, dotRadius: number): boolean {
        const distance = Math.sqrt((mouseX - dotX) ** 2 + (mouseY - dotY) ** 2);
        const isInside = distance <= dotRadius;
        return isInside;
    }
}