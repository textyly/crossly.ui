import { CanvasBuilder } from "./builder.js";
import { CanvasConfig } from "./canvas/types.js";
import { CueCanvasConfig, GridCanvasConfig, StitchCanvasConfig } from "./canvas/virtual/types.js";

const canvasBuilder = new CanvasBuilder();
const canvas = canvasBuilder.build();

const gridConfig: GridCanvasConfig = {
    dots: {
        columns: 40,
        rows: 30,
        color: "#9fa19f",
        radius:
        {
            value: 2,
            zoomStep: 0.2
        },
        spacing:
        {
            value: 25,
            zoomStep: 2.5
        }
    },
    lines: {
        color: "#d2d4d2",
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
            value: 5,
            zoomStep: 0.5
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
    line: {
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