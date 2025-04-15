import { StitchThread } from "./stitch.js";
import { DotIndex } from "../../../types.js";

export class CueThread extends StitchThread {

    constructor(color: string, width: number) {
        super(color, width);
    }

    public pushDotIndex(indexX: number, indexY: number): void {
        super.pushDot(indexX, indexY, 0, 0, false);
    }

    public popDotIndex(): DotIndex | undefined {
        const removed = super.popDot();
        return !removed ? undefined : { dotX: removed.dotX, dotY: removed.dotY };
    }

    public lastDotIndex(): DotIndex | undefined {
        const last = super.last();
        return !last ? undefined : { dotX: last.dotX, dotY: last.dotY };
    }
}