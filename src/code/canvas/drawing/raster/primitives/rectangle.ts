import { IShapeDrawing } from "../../types.js";

export class RasterRectangleDrawing implements IShapeDrawing {

    public draw(path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        // pythagorean equation
        const leg = Math.sqrt((width * width) / 2);

        // leftTop to rightBottom stitch (diagonal)
        if (fromX < toX && fromY < toY) {
            path.moveTo(fromX, fromY + leg);
            path.lineTo(toX - leg, toY);
            path.lineTo(toX, toY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(fromX, fromY + leg);
        }

        // rightBottom to leftTop stitch (diagonal)
        if (fromX > toX && fromY > toY) {
            path.moveTo(toX, toY + leg);
            path.lineTo(fromX - leg, fromY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(toX, toY + leg);
        }

        // rightTop to leftBottom stitch (diagonal)
        if (fromX > toX && fromY < toY) {
            path.moveTo(fromX - leg, fromY);
            path.lineTo(toX, toY - leg);
            path.lineTo(toX + leg, toY);
            path.lineTo(fromX, fromY + leg);
            path.lineTo(fromX - leg, fromY);
        }

        // leftBottom to rightTop stitch (diagonal)
        if (fromX < toX && fromY > toY) {
            path.moveTo(toX - leg, toY);
            path.lineTo(fromX, fromY - leg);
            path.lineTo(fromX + leg, fromY);
            path.lineTo(toX, toY + leg);
            path.lineTo(toX - leg, toY);
        }

        const l = width / 2;

        // left to right stitch (horizontal)
        if (fromX < toX && fromY == toY) {
            path.moveTo(fromX, fromY + l);
            path.lineTo(toX, toY + l);
            path.lineTo(toX, toY - l);
            path.lineTo(fromX, fromY - l);
        }

        // right to left stitch (horizontal)
        if (fromX > toX && fromY == toY) {
            path.moveTo(fromX, fromY - l);
            path.lineTo(toX, toY - l);
            path.lineTo(toX, toY + l);
            path.lineTo(fromX, fromY + l);
        }

        // top to bottom stitch (vertical)
        if (fromX == toX && fromY < toY) {
            path.moveTo(fromX - l, fromY);
            path.lineTo(toX - l, toY);
            path.lineTo(toX + l, toY);
            path.lineTo(fromX + l, fromY);
        }

        // bottom to top stitch (vertical)
        if (fromX == toX && fromY > toY) {
            path.moveTo(fromX + l, fromY);
            path.lineTo(toX + l, toY);
            path.lineTo(toX - l, toY);
            path.lineTo(fromX - l, fromY);
        }
    }
}