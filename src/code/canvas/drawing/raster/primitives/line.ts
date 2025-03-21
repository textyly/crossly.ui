import { IShapeDrawing } from "../../types.js";

export class RasterLineDrawing implements IShapeDrawing {

    public draw(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        path.moveTo(fromX, fromY);
        path.lineTo(toX, toY);
    }
}