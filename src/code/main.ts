import { CanvasBuilder } from "./builder.js";
import { CanvasConfig } from "./canvas/types.js";
import { CueCanvasConfig, GridCanvasConfig, StitchCanvasConfig } from "./canvas/virtual/types.js";

const gridConfig: GridCanvasConfig = {
    columns: 30,
    rows: 30,
    spacing: {
        value: 25,
        zoomStep: 0.5
    },
    dot: {
        color: "#9fa19f",
        radius: {
            value: 2,
            zoomStep: 0.1
        }
    },
    line: {
        color: "#d2d4d2",
        width: {
            value: 1,
            zoomStep: 0.05
        }
    }
};

const stitchConfig: StitchCanvasConfig = {
    dot: {
        color: "gray",
        radius: {
            value: 2,
            zoomStep: 0.1
        },
    },
    line: {
        color: "gray",
        width: {
            value: 6,
            zoomStep: 0.30
        }
    }
}

const cueConfig: CueCanvasConfig = {
    dot: {
        color: "gray",
        radius: {
            value: 4,
            zoomStep: 0.1
        },
    },
    line: {
        color: "gray",
        width: {
            value: 2,
            zoomStep: 0.05
        }
    }
}

const canvasConfig: CanvasConfig = {
    grid: gridConfig,
    stitch: stitchConfig,
    cue: cueConfig
}

const canvasBuilder = new CanvasBuilder();
canvasBuilder.withConfig(canvasConfig);

const canvas = canvasBuilder.build();
canvas.draw();