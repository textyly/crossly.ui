import { IShapeDrawing } from "../../types.js";
import assert from "../../../../asserts/assert.js";
import { Density } from "../../../virtual/types.js";

export class ShapeDrawing {
    private line: IShapeDrawing;
    private polygon: IShapeDrawing;
    private rectangle: IShapeDrawing;

    constructor(line: IShapeDrawing, rectangle: IShapeDrawing, polygon: IShapeDrawing) {
        this.line = line;
        assert.defined(this.line, "line");

        this.polygon = polygon;
        assert.defined(this.polygon, "polygon");

        this.rectangle = rectangle;
        assert.defined(this.rectangle, "rectangle");
    }

    public draw(density: Density, path: Path2D, fromX: number, fromY: number, toX: number, toY: number, width: number): void {
        switch (density) {
            case Density.Low: {
                // worse perf but most detailed drawing
                this.polygon.draw(path, fromX, fromY, toX, toY, width);
                break;
            }
            case Density.Medium: {
                // medium perf and drawing
                this.rectangle.draw(path, fromX, fromY, toX, toY, width);
                break;
            }
            case Density.High: {
                // best performance but less detailed drawing
                this.line.draw(path, fromX, fromY, toX, toY, width);
                break;
            }
            default: {
                // worse perf but most detailed drawing
                this.polygon.draw(path, fromX, fromY, toX, toY, width);
                break;
            }
        }
    }
}