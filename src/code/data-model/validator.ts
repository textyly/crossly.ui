import assert from "../asserts/assert.js";
import { CrosslyCanvasPattern, FabricPattern, StitchPattern } from "../canvas/types.js";
import { CrosslyDataModel, FabricDataModel, IValidator, PatternDataModel } from "./types.js";

export class Validator implements IValidator {

    public validateDataModel(dataModel: CrosslyDataModel): void {
        assert.defined(dataModel, "dataModel");
        this.validate(dataModel.fabric, dataModel.pattern);
    }

    public validatePattern(pattern: CrosslyCanvasPattern): void {
        assert.defined(pattern, "pattern");
        this.validate(pattern.fabric, pattern.stitch);
    }

    private validate(fabric: FabricDataModel | FabricPattern, pattern: PatternDataModel | StitchPattern): void {
        assert.defined(fabric, "fabric");
        assert.greaterThanZero(fabric.name.length, "fabric.name.length");
        assert.greaterThanZero(fabric.columns, "fabric.columns");
        assert.greaterThanZero(fabric.rows, "fabric.rows");
        assert.greaterThanZero(fabric.color.length, "fabric.color.length");
        assert.greaterThanZero(fabric.dots.color.length, "fabric.dots.color.length");
        assert.greaterThanZero(fabric.threads.color.length, "fabric.threads.color.length");

        assert.defined(pattern, "pattern");
        assert.greaterThanZero(pattern.length, "pattern.length");
    }
}