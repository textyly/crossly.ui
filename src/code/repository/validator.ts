import assert from "../asserts/assert.js";
import { CrosslyCanvasData } from "../canvas/types.js";
import { IValidator } from "./types.js";
import { CrosslyDataModel } from "../data-model/types.js";

export class Validator implements IValidator {

    public validateDataModel(dataModel: CrosslyDataModel): void {
        const name = dataModel.name;
        assert.greaterThanZero(name.length, "name.length");

        const fabric = dataModel.fabric;
        assert.greaterThanZero(fabric.name.length, "fabric.name.length");
        assert.greaterThanZero(fabric.columns, "fabric.columns");
        assert.greaterThanZero(fabric.rows, "fabric.rows");
        assert.greaterThanZero(fabric.color.length, "fabric.color.length");
        assert.greaterThanZero(fabric.dots.color.length, "fabric.dots.color.length");
        assert.greaterThanZero(fabric.threads.color.length, "fabric.threads.color.length");

        const pattern = dataModel.pattern;
        assert.greaterThanZero(pattern.length, "pattern.length");
    }

    public validateCanvasData(canvasData: CrosslyCanvasData): void {
        throw new Error("not implemented");
    }
}