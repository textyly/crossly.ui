import { CueThreadPath } from "./thread/cue.js";
import { StitchThreadPath } from "./thread/stitch.js";
import { CuePattern, StitchPattern } from "../../types.js";
import { ICueThreadPath, IStitchThreadPath } from "./types.js";

export class PatternCloning {
    public cloneStitchPattern(pattern: StitchPattern): StitchPattern {
        const patternCopy = new Array<IStitchThreadPath>();

        pattern.forEach((threadPath) => {
            const threadCopy = new StitchThreadPath(threadPath.name, threadPath.color, threadPath.width);

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


    public cloneCuePattern(pattern: CuePattern): CuePattern {
        const patternCopy = new Array<ICueThreadPath>();

        pattern.forEach((threadPath) => {
            const threadPathCopy = new CueThreadPath(threadPath.color, threadPath.width);

            const indexesX = threadPath.indexesX;
            const indexesY = threadPath.indexesY;

            for (let index = 0; index < threadPath.length; index++) {
                const indexX = indexesX[index];
                const indexY = indexesY[index];
                threadPathCopy.pushDotIndex(indexX, indexY);
            }

            patternCopy.push(threadPathCopy);
        });

        return patternCopy;
    }
}

export default new PatternCloning();