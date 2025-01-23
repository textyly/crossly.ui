import { CanvasSide, Dot, GridDot, GridLine, StitchDot, StitchLine, Visibility } from "../canvas/types.js";

export class Converter {
    public convertToStitchDot(gridDot: GridDot, side: CanvasSide): StitchDot {
        const dot: Dot = {
            id: gridDot.id,
            x: gridDot.x,
            y: gridDot.y,
            radius: gridDot.radius,
            color: gridDot.color,
        };

        const stitchDot = { ...dot, side };
        return stitchDot;
    }

    public convertToGridDot(stitchDot: StitchDot, visibility: Visibility): GridDot {
        const dot: Dot = {
            id: stitchDot.id,
            x: stitchDot.x,
            y: stitchDot.y,
            radius: stitchDot.radius,
            color: stitchDot.color,
        };

        const gridDot = { ...dot, visibility };
        return gridDot;
    }

    public convertToStitchLine(from: GridDot, to: GridDot, width: number, side: CanvasSide, color: string): StitchLine {
        const fromStitchDot = this.convertToStitchDot(from, side);
        const toStitchDot = this.convertToStitchDot(to, side);

        const stitchLine = { from: fromStitchDot, to: toStitchDot, width, color, side };
        return stitchLine;
    }

    public convertToGridLine(from: StitchDot, to: StitchDot, width: number, visibility: Visibility, color: string): GridLine {
        const fromGridDot = this.convertToGridDot(from, visibility);
        const toGridDot = this.convertToGridDot(to, visibility);

        const gridLine = { from: fromGridDot, to: toGridDot, width, color, visibility };
        return gridLine;
    }
}