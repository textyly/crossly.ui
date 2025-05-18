import { IValidator } from "../repository/types.js";
import assert from "../asserts/assert.js";
import { CrosslyCanvasPattern, FabricPattern, StitchPattern } from "../canvas/types.js";
import { CrosslyDataModel, FabricDataModel, PatternDataModel } from "./types.js";

export class Validator implements IValidator {

    public validateDataModel(dataModel: CrosslyDataModel): void {
        this.validate(dataModel.name, dataModel.fabric, dataModel.pattern);
    }

    public validateCanvasData(canvasData: CrosslyCanvasPattern): void {
        this.validate(canvasData.name, canvasData.fabricPattern, canvasData.stitchPattern);
    }

    private validate(name: string, fabric: FabricDataModel | FabricPattern, stitchPattern: PatternDataModel | StitchPattern): void {
        assert.greaterThanZero(name.length, "name.length");
        assert.greaterThanZero(fabric.name.length, "fabric.name.length");
        assert.greaterThanZero(fabric.columns, "fabric.columns");
        assert.greaterThanZero(fabric.rows, "fabric.rows");
        assert.greaterThanZero(fabric.color.length, "fabric.color.length");
        assert.greaterThanZero(fabric.dots.color.length, "fabric.dots.color.length");
        assert.greaterThanZero(fabric.threads.color.length, "fabric.threads.color.length");
        assert.greaterThanZero(stitchPattern.length, "pattern.length");
    }
}