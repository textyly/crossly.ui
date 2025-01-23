import { CanvasBuilder } from "./builder.js";
import { CanvasConfig } from "./canvas/types.js";
import { CueCanvasConfig, GridCanvasConfig, StitchCanvasConfig } from "./canvas/virtual/types.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

const gridConfig: GridCanvasConfig = {
    dots: {
        columns: 40,
        rows: 30,
        color: "gray",
        radius:
        {
            value: 2,
            zoomStep: 0.2
        },
        spacing:
        {
            value: 30,
            zoomStep: 2
        }
    },
    lines: {
        color: "gray",
        width: {
            value: 1,
            zoomStep: 0.1
        }
    }
};

const stitchConfig: StitchCanvasConfig = {
    dots: {
        color: "gray",
        radius: {
            value: 2,
            zoomStep: 0.2
        },
    },
    lines: {
        color: "gray",
        width: {
            value: 6,
            zoomStep: 0.6
        }
    }
}

const cueConfig: CueCanvasConfig = {
    dot: {
        color: "gray",
        radius: {
            value: 4,
            zoomStep: 0.4
        },
    },
    link: {
        color: "gray",
        width: {
            value: 2,
            zoomStep: 0.2
        }
    }
}

const canvasConfig: CanvasConfig = {
    grid: gridConfig,
    stitch: stitchConfig,
    cue: cueConfig
}

canvas.draw(canvasConfig);