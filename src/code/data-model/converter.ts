import { IThreadPath } from "../canvas/utilities/arrays/types.js";
import { ThreadPath } from "../canvas/utilities/arrays/thread/stitch.js";
import { CrosslyCanvasPattern, FabricPattern, StitchPattern } from "../canvas/types.js";
import {
    FabricDataModel,
    ThreadDataModel,
    PatternDataModel,
    ThreadsDataModel,
    CrosslyDataModel,
    ThreadPathDataModel,
    IConverter,
} from "./types.js";

export class Converter implements IConverter {

    public convertToDataModel(canvasData: CrosslyCanvasPattern): CrosslyDataModel {
        const name = canvasData.name;
        const fabric = canvasData.fabricPattern;
        const pattern = canvasData.stitchPattern;

        const fabricDataModel = this.convertToFabricDataModel(fabric);
        const threadsDataModel = this.convertToThreadsDataModel(pattern);
        const patternDataModel = this.convertToPatternDataModel(pattern, threadsDataModel);

        const dataModel = {
            name,
            fabric: fabricDataModel,
            threads: threadsDataModel,
            pattern: patternDataModel,
        };

        return dataModel;
    }

    public convertToCanvasData(dataModel: CrosslyDataModel): CrosslyCanvasPattern {
        const name = dataModel.name;
        const fabricDataModel = dataModel.fabric;
        const threadsDataModel = dataModel.threads;
        const patternDataModel = dataModel.pattern;

        const fabricPattern = this.convertToFabricCanvasData(fabricDataModel);
        const stitchPattern = this.convertToPatternCanvasData(patternDataModel, threadsDataModel);

        const canvasData = { name, fabricPattern, stitchPattern };
        return canvasData;
    }

    private convertToFabricDataModel(fabric: FabricPattern): FabricDataModel {
        const name = fabric.name;
        const columns = fabric.columns;
        const rows = fabric.rows;
        const color = fabric.color;

        const fabricDots = fabric.dots;
        const dots = {
            color: fabricDots.color
        };

        const fabricThreads = fabric.threads;
        const threads = {
            color: fabricThreads.color
        };

        const fabricDataMode = { name, columns, rows, color, dots, threads };
        return fabricDataMode;
    }

    private convertToThreadsDataModel(pattern: StitchPattern): ThreadsDataModel {
        const threadsDataModel = new Array<ThreadDataModel>();

        pattern.forEach((thread) => {
            // TODO: use thread equality func
            const exists = threadsDataModel.find((t) => t.color === thread.color && t.width === thread.width);
            if (!exists) {

                const threadDataModel = {
                    name: thread.name,
                    color: thread.color,
                    width: thread.width
                };

                threadsDataModel.push(threadDataModel);
            }
        });

        return threadsDataModel;
    }

    private convertToPatternDataModel(pattern: StitchPattern, threads: ThreadsDataModel): PatternDataModel {
        const patternDataModel = new Array<ThreadPathDataModel>();

        pattern.forEach((threadPath) => {
            // TODO: use thread equality func
            const threadIndex = threads.findIndex((t) => t.color === threadPath.color && t.width === threadPath.width);

            const indexesX = [...threadPath.indexesX];
            const indexesY = [...threadPath.indexesY];
            const needlePath = { indexesX, indexesY };

            const threadPathDataModel = { threadIndex, needlePath };
            patternDataModel.push(threadPathDataModel);
        });

        return patternDataModel;
    }

    // TODO: this method has not been tested!!!
    private convertToFabricCanvasData(fabricDataModel: FabricDataModel): FabricPattern {
        const name = fabricDataModel.name;
        const color = fabricDataModel.color;
        const rows = fabricDataModel.rows;
        const columns = fabricDataModel.columns;

        const dotsDataModel = fabricDataModel.dots;
        const dots = {
            color: dotsDataModel.color
        };

        const threadsDataModel = fabricDataModel.threads;
        const threads = {
            color: threadsDataModel.color
        }

        const fabric = { name, rows, columns, color, dots, threads };
        return fabric;
    }

    // TODO: this method has not been tested!!!
    private convertToPatternCanvasData(patternDataModel: PatternDataModel, threadsDataModel: ThreadsDataModel): StitchPattern {
        const stitchPattern = new Array<IThreadPath>();

        patternDataModel.forEach((threadPathDataModel) => {
            const threadIndex = threadPathDataModel.threadIndex;
            const threadDataModel = threadsDataModel[threadIndex];

            const needlePath = threadPathDataModel.needlePath;
            const indexesX = needlePath.indexesX;
            const indexesY = needlePath.indexesY;
            const length = indexesX.length;

            const thread = new ThreadPath(threadDataModel.name, threadDataModel.color, threadDataModel.width);

            for (let index = 0; index < length; index++) {

                const indexX = indexesX[index];
                const indexY = indexesY[index];
                thread.pushDotIndex(indexX, indexY);
            }

            stitchPattern.push(thread);
        });

        return stitchPattern;
    }
}