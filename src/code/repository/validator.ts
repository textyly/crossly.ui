import { IValidator } from "./types.js";
import assert from "../asserts/assert.js";
import { CrosslyCanvasData } from "../canvas/types.js";
import { CrosslyDataModel } from "../data-model/types.js";

export class Validator implements IValidator {

    public validateDataModel(dataModel: CrosslyDataModel): void {
        this.validate(dataModel);
    }

    public validateCanvasData(canvasData: CrosslyCanvasData): void {
        this.validate(canvasData);
    }

    private validate(data: CrosslyDataModel | CrosslyCanvasData): void {
        const name = data.name;
        assert.greaterThanZero(name.length, "name.length");

        const fabric = data.fabric;
        assert.greaterThanZero(fabric.name.length, "fabric.name.length");
        assert.greaterThanZero(fabric.columns, "fabric.columns");
        assert.greaterThanZero(fabric.rows, "fabric.rows");
        assert.greaterThanZero(fabric.color.length, "fabric.color.length");
        assert.greaterThanZero(fabric.dots.color.length, "fabric.dots.color.length");
        assert.greaterThanZero(fabric.threads.color.length, "fabric.threads.color.length");

        const pattern = data.pattern;
        assert.greaterThanZero(pattern.length, "pattern.length");
    }
}