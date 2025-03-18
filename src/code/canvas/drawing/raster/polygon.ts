import { IShapeDrawing } from "../types.js";

export class RasterPolygonDrawing implements IShapeDrawing {

    public draw(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        // pythagorean equation
        const leg = Math.floor(Math.sqrt((width * width) / 2));

        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(toX - leg, toY);
            path.lineTo(toX, toY);
            path.lineTo(toX, toY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(fromX, fromY);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(toX, toY);
            path.lineTo(toX, toY + leg);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(fromX, fromY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(toX, toY);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(toX, toY - leg);
            path.lineTo(toX, toY);
            path.lineTo(toX + leg, toY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(fromX, fromY);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(toX, toY);
            path.lineTo(toX - leg, toY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(fromX, fromY);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(toX, toY + leg);
            path.lineTo(toX, toY);
        }

        // pythagorean equation
        const l = Math.floor(Math.sqrt((leg * leg) / 2));

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX + l, fromY + l);
            path.lineTo(toX - l, toY + l);
            path.lineTo(toX, toY);
            path.lineTo(toX - l, toY - l);
            path.lineTo(fromX + l, fromY - l);
            path.lineTo(fromX, fromY);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - l, fromY - l);
            path.lineTo(toX + l, toY - l);
            path.lineTo(toX, toY);
            path.lineTo(toX + l, toY + l);
            path.lineTo(fromX - l, fromY + l);
            path.lineTo(fromX, fromY);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX - l, fromY + l);
            path.lineTo(toX - l, toY - l);
            path.lineTo(toX, toY);
            path.lineTo(toX + l, toY - l);
            path.lineTo(fromX + l, fromY + l);
            path.lineTo(fromX, fromY);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX, fromY);
            path.lineTo(fromX + l, fromY - l);
            path.lineTo(toX + l, toY + l);
            path.lineTo(toX, toY);
            path.lineTo(toX - l, toY + l);
            path.lineTo(fromX - l, fromY - l);
            path.lineTo(fromX, fromY);
        }
    }
}