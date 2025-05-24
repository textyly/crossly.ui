import { StitchPattern } from "../../types.js";
import { ThreadPath } from "./thread/stitch.js";
import { IThreadPath } from "./types.js";

export class PatternCloning {
    public clone(pattern: StitchPattern): StitchPattern {
        const patternCopy = new Array<IThreadPath>();

        pattern.forEach((threadPath) => {
            const threadCopy = new ThreadPath(threadPath.name, threadPath.color, threadPath.width);

            const indexesX = threadPath.indexesX;
            const indexesY = threadPath.indexesY;

            for (let index = 0; index < threadPath.length; index++) {
                const indexX = indexesX[index];
                const indexY = indexesY[index];
                threadCopy.pushDotIndex(indexX, indexY);
            }

            patternCopy.push(threadCopy);
        });

        return patternCopy;
    }
}

export default new PatternCloning();