import { CanvasSide, CueDot, Dot, GridDot, StitchDot, Visibility } from "../canvas/types.js";

export class Converter {

    public convertToGridDot(stitchDot: StitchDot, visibility: Visibility): GridDot {
        const dot = this.copyDot(stitchDot);
        const gridDot = { ...dot, visibility };
        return gridDot;
    }

    public convertToStitchDot(gridDot: GridDot, side: CanvasSide): StitchDot {
        const dot = this.copyDot(gridDot);
        const stitchDot = { ...dot, side };
        return stitchDot;
    }

    public convertToCueDot(gridDot: GridDot): CueDot {
        const dot = this.copyDot(gridDot);
        return dot;
    }

    private copyDot(dot: Dot): Dot {
        const id = dot.id;
        const x = dot.x;
        const y = dot.y;

        const copy = { id, x, y };
        return copy;
    }
}