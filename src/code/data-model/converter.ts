import { IStitchThreadPath } from "../canvas/utilities/arrays/types.js";
import { StitchThreadPath } from "../canvas/utilities/arrays/thread/stitch.js";
import { CrosslyCanvasPattern, FabricPattern, StitchPattern } from "../canvas/types.js";
import {
    IConverter,
    FabricDataModel,
    ThreadDataModel,
    PatternDataModel,
    ThreadsDataModel,
    CrosslyDataModel,
    ThreadPathDataModel,
} from "./types.js";

export class Converter implements IConverter {

    public get version(): string {
        // increase on breaking change and keep in sync with data model's version!!!
        return "0.0.0.1";
    }

    public convertToDataModel(name: string, pattern: CrosslyCanvasPattern): CrosslyDataModel {
        const fabricPattern = pattern.fabric;
        const stitchPattern = pattern.stitch;

        const fabricDataModel = this.convertToFabricDataModel(fabricPattern);
        const threadsDataModel = this.convertToThreadsDataModel(stitchPattern);
        const patternDataModel = this.convertToPatternDataModel(stitchPattern, threadsDataModel);

        const dataModel = {
            version: this.version,
            name,
            fabric: fabricDataModel,
            threads: threadsDataModel,
            pattern: patternDataModel,
        };

        return dataModel;
    }

    public convertToCrosslyPattern(dataModel: CrosslyDataModel): CrosslyCanvasPattern {
        if (this.version !== dataModel.version) {
            throw new Error(`version mismatch, converter version is ${this.version} whereas data mode version is ${dataModel.version}`);
        }

        const fabricDataModel = dataModel.fabric;
        const threadsDataModel = dataModel.threads;
        const patternDataModel = dataModel.pattern;

        const fabric = this.convertToFabricPattern(fabricDataModel);
        const stitch = this.convertToStitchPattern(patternDataModel, threadsDataModel);

        const pattern = { name: dataModel.name, fabric, stitch };
        return pattern;
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

    private convertToFabricPattern(fabricDataModel: FabricDataModel): FabricPattern {
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

    private convertToStitchPattern(patternDataModel: PatternDataModel, threadsDataModel: ThreadsDataModel): StitchPattern {
        const stitchPattern = new Array<IStitchThreadPath>();

        patternDataModel.forEach((threadPathDataModel) => {
            const threadIndex = threadPathDataModel.threadIndex;
            const threadDataModel = threadsDataModel[threadIndex];

            // TODO: use PatternCloning
            const needlePath = threadPathDataModel.needlePath;
            const indexesX = needlePath.indexesX;
            const indexesY = needlePath.indexesY;
            const length = indexesX.length;

            const thread = new StitchThreadPath(threadDataModel.name, threadDataModel.color, threadDataModel.width);

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