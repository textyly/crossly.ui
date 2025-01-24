import { CanvasSide, Dot, GridDot, StitchDot, Visibility } from "../canvas/types.js";

export class Converter {

    public convertToGridDot(stitchDot: StitchDot, color: string, visibility: Visibility): GridDot {
        const dot: Dot = {
            id: stitchDot.id,
            x: stitchDot.x,
            y: stitchDot.y,
            radius: stitchDot.radius,
            color: color,
        };

        const gridDot = { ...dot, visibility };
        return gridDot;
    }

    public convertToStitchDot(gridDot: GridDot, color: string, side: CanvasSide): StitchDot {
        const dot: Dot = {
            id: gridDot.id,
            x: gridDot.x,
            y: gridDot.y,
            radius: gridDot.radius,
            color: color,
        };

        const stitchDot = { ...dot, side };
        return stitchDot;
    }
}