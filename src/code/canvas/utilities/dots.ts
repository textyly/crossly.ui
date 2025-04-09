import { Dot } from "../types.js";

export class DotsUtility<TDot extends Dot> {
    public areDotsEqual(dot1: TDot, dot2: TDot): boolean {
        const isEqualByX = dot1?.x === dot2?.x;
        const isEqualByY = dot1?.y === dot2?.y;
        return isEqualByX && isEqualByY;
    }
}