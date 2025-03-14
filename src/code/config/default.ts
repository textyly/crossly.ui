import { CrosslyCanvasConfig, CueCanvasConfig, FabricCanvasConfig, SpacingConfig, StitchCanvasConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 30;
        const rows = 30;

        const dotSpacing: SpacingConfig = {
            space: 28,
            spaceZoomStep: 2
        }

        const fabricConfig: FabricCanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "#9fa19f",
                radius: 1.4,
                minRadius: 0.6,
                radiusZoomStep: 0.2
            },
            thread: {
                color: "#d2d4d2",
                width: 1.4,
                minWidth: 0.8,
                widthZoomStep: 0.2
            }
        };

        const stitchConfig: StitchCanvasConfig = {
            columns,
            rows,
            dotSpacing,
            thread: {
                color: "gray",
                width: 10,
                minWidth: 1,
                widthZoomStep: 1
            }
        };

        const cueConfig: CueCanvasConfig = {
            columns,
            rows,
            dotSpacing,
            dot: {
                color: "#615858",
                radius: 10,
                minRadius: 1,
                radiusZoomStep: 1
            },
            thread: {
                color: "gray",
                width: 10,
                minWidth: 1,
                widthZoomStep: 1
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