import { CanvasConfig, CrosslyCanvasConfig, SpacingConfig, ZoomItemConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 300;
        const rows = 300;

        const spacing: SpacingConfig = {
            value: 25,
            zoomInStep: 0.5,
            zoomOutStep: 0.5
        }

        const dotMatchDistance: ZoomItemConfig = {
            value: 4,
            zoomInStep: 0.2,
            zoomOutStep: 0.1
        }

        const gridConfig: CanvasConfig = {
            columns,
            rows,
            spacing,
            dot: {
                color: "#9fa19f",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.1
                },
                dotMatchDistance
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
            spacing,
            dot: {
                color: "gray",
                radius: {
                    value: 2,
                    zoomInStep: 0.1,
                    zoomOutStep: 0.1
                },
                dotMatchDistance
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

        const cueConfig: CanvasConfig = {
            columns,
            rows,
            spacing,
            dot: {
                color: "gray",
                radius: {
                    value: 4,
                    zoomInStep: 0.2,
                    zoomOutStep: 0.1
                },
                dotMatchDistance
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