import { IShapeDrawing } from "../types.js";

export class RasterLineDrawing implements IShapeDrawing {

    public draw(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        let w = Math.ceil(width / 4);

        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX + w, fromY + w);
            path.lineTo(toX - w, toY - w);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(fromX - w, fromY - w);
            path.lineTo(toX + w, toY + w);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX - w, fromY + w);
            path.lineTo(toX + w, toY - w);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(fromX + w, fromY - w);
            path.lineTo(toX - w, toY + w);
        }

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX + w, fromY);
            path.lineTo(toX - w, toY);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX - w, fromY);
            path.lineTo(toX + w, toY);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX, fromY + w);
            path.lineTo(toX, toY - w);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX, fromY - w);
            path.lineTo(toX, toY + w);
        }
    }
}