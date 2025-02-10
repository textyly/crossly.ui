import { CrosslyCanvasConfig, CueCanvasConfig, GridCanvasConfig, StitchCanvasConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {

        const gridConfig: GridCanvasConfig = {
            columns: 6,
            rows: 6,
            spacing: {
                value: 25,
                zoomInStep: 0.5,
                zoomOutStep: 0.5
            },
            dot: {
                color: "#9fa19f",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.1
                },
                dotMatchDistance: {
                    value: 4,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.1
                }
            },
            thread: {
                color: "#d2d4d2",
                width: {
                    value: 1,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.05
                }
            }
        };

        const stitchConfig: StitchCanvasConfig = {
            dot: {
                color: "gray",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.1
                },
            },
            thread: {
                color: "gray",
                width: {
                    value: 5,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.2
                }
            }
        };

        const cueConfig: CueCanvasConfig = {
            dot: {
                color: "gray",
                radius: {
                    value: 4,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.1
                },
            },
            thread: {
                color: "gray",
                width: {
                    value: 5,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.2
                }
            }
        };

        const canvasConfig: CrosslyCanvasConfig = {
            grid: gridConfig,
            stitch: stitchConfig,
            cue: cueConfig
        };

        return canvasConfig;
    }
}