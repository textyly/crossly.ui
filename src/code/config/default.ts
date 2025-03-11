import { CanvasConfig, CrosslyCanvasConfig, SpacingConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 300;
        const rows = 300;

        const dotSpacing: SpacingConfig = {
            value: 25,
            zoomInStep: 1,
            zoomOutStep: 1
        }

        const fabricConfig: CanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "#9fa19f",
                radius: {
                    value: 1,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            },
            thread: {
                color: "#d2d4d2",
                width: {
                    value: 1,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            }
        };

        const stitchConfig: CanvasConfig = {
            columns,
            rows,
            dotSpacing,
            // TODO: delete, but config reorganization needed
            dot: {
                color: "gray",
                radius: {
                    value: 3,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            },
            thread: {
                color: "gray",
                width: {
                    value: 6,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            }
        };

        const cueConfig: CanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "gray",
                radius: {
                    value: 6,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            },
            thread: {
                color: "gray",
                width: {
                    value: 6,
                    zoomInStep: 0,
                    zoomOutStep: 0
                }
            }
        };

        const canvasConfig: CrosslyCanvasConfig = {
            fabric: fabricConfig,
            stitch: stitchConfig,
            cue: cueConfig
        };

        return canvasConfig;
    }
}