import { CrosslyCanvasConfig, CueCanvasConfig, FabricCanvasConfig, InputCanvasConfig, DotsSpacingConfig, StitchCanvasConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 30;
        const rows = 30;

        const inputConfig: InputCanvasConfig = {
            ignoreMoveUntil: 10,
            ignoreZoomUntil: 10
        }

        const dotsSpacing: DotsSpacingConfig = {
            space: 28,
            minSpace: 4,
            spaceZoomStep: 4
        };

        const fabricConfig: FabricCanvasConfig = {
            columns,
            rows,
            dotsSpacing: dotsSpacing,
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
            dotsSpacing: dotsSpacing,
            thread: {
                color: "gray",
                width: 14,
                minWidth: 2,
                widthZoomStep: 2
            }
        };

        const cueConfig: CueCanvasConfig = {
            columns,
            rows,
            dotsSpacing: dotsSpacing,
            dot: {
                color: "#615858",
                radius: 14,
                minRadius: 2,
                radiusZoomStep: 2
            },
            thread: {
                color: "gray",
                width: 14,
                minWidth: 2,
                widthZoomStep: 2
            }
        };

        const canvasConfig: CrosslyCanvasConfig = {
            input: inputConfig,
            fabric: fabricConfig,
            stitch: stitchConfig,
            cue: cueConfig
        };

        return canvasConfig;
    }
}