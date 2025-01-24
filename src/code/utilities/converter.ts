import { CanvasSide, Dot, GridDot, StitchDot, Visibility } from "../canvas/types.js";

export class Converter {

    public convertToGridDot(stitchDot: StitchDot, color: string, visibility: Visibility): GridDot {
        const dot = this.copyDot(stitchDot, color);
        const gridDot = { ...dot, visibility };
        return gridDot;
    }

    public convertToStitchDot(gridDot: GridDot, color: string, side: CanvasSide): StitchDot {
        const dot = this.copyDot(gridDot, color);
        const stitchDot = { ...dot, side };
        return stitchDot;
    }

    private copyDot(dot: Dot, color: string): Dot {
        const id = dot.id;
        const x = dot.x;
        const y = dot.y;
        const radius = dot.radius;

        const copy = { id, x, y, radius, color };
        return copy;
    }
}