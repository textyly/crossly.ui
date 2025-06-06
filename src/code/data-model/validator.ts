import assert from "../asserts/assert.js";
import { CrosslyCanvasPattern, FabricPattern, StitchPattern } from "../canvas/types.js";
import { CrosslyDataModel, FabricDataModel, IValidator, PatternDataModel, ThreadsDataModel } from "./types.js";

export class Validator implements IValidator {

    public get version(): string {
        // increase on breaking change and keep in sync with data model's version!!!
        return "0,0,0,1";
    }

    public validateDataModel(dataModel: CrosslyDataModel): void {
        assert.greaterThanZero(dataModel?.name?.length, "dataModel.name.length");

        this.validateFabricDataModel(dataModel.fabric);
        this.validateThreadsDataModel(dataModel.threads);
        this.validatePatternDataModel(dataModel.pattern);
    }

    public validateCrosslyPattern(pattern: CrosslyCanvasPattern): void {
        assert.defined(pattern, "pattern");

        this.validateFabricDataModel(pattern.fabric);
        this.validateStitchPattern(pattern.stitch);
    }

    private validateFabricDataModel(fabric: FabricDataModel | FabricPattern): void {
        assert.greaterThanZero(fabric?.name?.length, "fabric.name.length");
        assert.greaterThanZero(fabric?.columns, "fabric.columns");
        assert.greaterThanZero(fabric?.rows, "fabric.rows");
        assert.greaterThanZero(fabric?.color?.length, "fabric.color.length");
        assert.greaterThanZero(fabric?.dots?.color?.length, "fabric.dots.color.length");
        assert.greaterThanZero(fabric?.threads?.color?.length, "fabric.threads.color.length");
    }

    private validateThreadsDataModel(threadsDataModel: ThreadsDataModel): void {
        assert.defined(threadsDataModel, "threadsDataModel");

        threadsDataModel.forEach((thread) => {
            assert.greaterThanZero(thread?.name?.length, "thread.name.length");
            assert.greaterThanZero(thread?.color?.length, "thread.color.length");
            assert.greaterThanZero(thread?.width, "thread.width");
        });
    }

    private validatePatternDataModel(patternDataModel: PatternDataModel): void {
        assert.greaterThanZero(patternDataModel?.length, "patternDataModel.length");

        patternDataModel.forEach((threadPath) => {
            assert.positive(threadPath?.threadIndex, "threadPath.threadIndex");

            const indexesX = threadPath?.needlePath?.indexesX;
            assert.defined(indexesX, "indexesX");

            const indexesY = threadPath?.needlePath?.indexesY;
            assert.defined(indexesY, "indexesY");

            assert.that(indexesX.length === indexesY.length, "indexesX and indexesY lengths must be equal.");

            for (let index = 0; index < indexesX.length; index++) {
                const x = indexesX[index];
                assert.positive(x, "x");

                const y = indexesX[index];
                assert.positive(y, "y");
            }
        });
    }

    private validateStitchPattern(crosslyCanvasPattern: StitchPattern): void {
        assert.greaterThanZero(crosslyCanvasPattern?.length, "crosslyCanvasPattern.length");

        crosslyCanvasPattern.forEach((threadPath) => {
            assert.greaterThanZero(threadPath?.name?.length, "threadPath.name.length");
            assert.greaterThanZero(threadPath?.color?.length, "threadPath.color.length");
            assert.greaterThanZero(threadPath?.width, "threadPath.width");

            const indexesX = threadPath?.indexesX;
            assert.defined(indexesX, "indexesX");

            const indexesY = threadPath?.indexesY;
            assert.defined(indexesY, "indexesY");

            assert.that(indexesX.length === indexesY.length, "indexesX and indexesY lengths must be equal.");
            assert.that(indexesX.length === threadPath.length, "indexes length must be equal to threadPath length.");

            for (let index = 0; index < threadPath.length; index++) {
                const x = indexesX[index];
                assert.positive(x, "x");

                const y = indexesX[index];
                assert.positive(y, "y");
            }
        });
    }
}