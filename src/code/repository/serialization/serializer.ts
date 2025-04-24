import assert from "../../asserts/assert.js";
import { Fabric } from "../../canvas/virtual/types.js";
import { CrosslyCanvasData, StitchPattern } from "../../canvas/types.js";
import {
    FabricDataModel,
    ThreadDataModel,
    PatternDataModel,
    ThreadsDataModel,
    CrosslyDataModel,
    ICrosslySerializer,
    ThreadPathDataModel,
} from "./types.js";

export class CrosslySerializer implements ICrosslySerializer {

    public serialize(canvasData: CrosslyCanvasData): CrosslyDataModel {
        const name = canvasData.name;
        const fabric = canvasData.fabric;
        const pattern = canvasData.pattern;

        const fabricDataModel = this.convertToFabricDataModel(fabric);
        const threadsDataModel = this.convertToThreadsDataMode(pattern);
        const patternDataModel = this.convertToPatternDataModel(pattern, threadsDataModel);

        const dataModel = {
            name,
            fabric: fabricDataModel,
            threads: threadsDataModel,
            pattern: patternDataModel,
        };

        return dataModel;
    }

    public deserialize(dataModel: CrosslyDataModel): CrosslyCanvasData {
        throw new Error("Method not implemented.");
    }

    private convertToFabricDataModel(fabric: Fabric): FabricDataModel {
        const name = fabric.name;
        const columns = fabric.columns;
        const rows = fabric.rows;
        const color = fabric.color;

        const fabricDots = fabric.dots;
        const fabricDotsSpacing = fabric.dotsSpacing;

        const dots = {
            color: fabricDots.color,
            radius: fabricDots.radius,
            space: fabricDotsSpacing.space,
            hidden: {
                enabled: fabricDots.hidden.enabled,
            },
        };

        const fabricThreads = fabric.threads;

        const threads = {
            color: fabricThreads.color,
            width: fabricThreads.width,
        }

        const fabricDataMode = { name, columns, rows, color, dots, threads, };
        return fabricDataMode;
    }

    private convertToThreadsDataMode(pattern: StitchPattern): ThreadsDataModel {
        const threadsDataModel = new Array<ThreadDataModel>();

        pattern.forEach((thread) => {
            // TODO: use thread equality func
            const exists = threadsDataModel.find((t) => t.color === thread.color && t.width === thread.width);
            if (!exists) {

                const threadDataModel = {
                    name: thread.color, // TODO: introduce a name!!!
                    color: thread.color,
                    width: thread.width,
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
            assert.positive(threadIndex, "threadIndex");

            const indexesX = [...threadPath.indexesX];
            const indexesY = [...threadPath.indexesY];
            const needlePath = { indexesX, indexesY };

            const threadPathDataModel = { threadIndex, needlePath };
            patternDataModel.push(threadPathDataModel);
        });

        return patternDataModel;
    }
}