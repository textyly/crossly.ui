import { CanvasConfig, CrosslyCanvasConfig, SpacingConfig, ZoomItemConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 42;
        const rows = 24;

        const dotSpacing: SpacingConfig = {
            value: 25,
            zoomInStep: 0.5,
            zoomOutStep: 0.5
        }

        const fabricConfig: CanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "#9fa19f",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
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

        const stitchConfig: CanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "gray",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.05
                }
            },
            thread: {
                color: "gray",
                width: {
                    value: 5,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.1
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
                    value: 4,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.05
                }
            },
            thread: {
                color: "gray",
                width: {
                    value: 5,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.1
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