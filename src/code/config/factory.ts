import { CrosslyCanvasConfig, CueCanvasConfig, FabricCanvasConfig, InputCanvasConfig, DotsSpacingConfig, StitchCanvasConfig } from "../canvas/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 30;
        const rows = 30;

        const input = this.createInputConfig();
        const dotsSpacing = this.createDotsSpacingConfig();

        const fabric = this.createFabricCanvasConfig(columns, rows, dotsSpacing);
        const stitch = this.createStitchCanvasConfig(columns, rows, dotsSpacing);
        const cue = this.createCueCanvasConfig(columns, rows, dotsSpacing);

        const canvasConfig = { input, fabric, stitch, cue };
        return canvasConfig;
    }

    private createInputConfig(): InputCanvasConfig {
        const inputConfig = {
            ignoreMoveUntil: 10,
            ignoreZoomUntil: 10
        }
        return inputConfig;
    }

    private createDotsSpacingConfig(): DotsSpacingConfig {
        const dotsSpacing = {
            space: 28,
            minSpace: 4,
            spaceZoomStep: 4
        };
        return dotsSpacing;
    }

    private createFabricCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): FabricCanvasConfig {
        const fabricConfig = {
            columns,
            rows,
            dotsSpacing,
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
        return fabricConfig;
    }

    private createStitchCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): StitchCanvasConfig {
        const stitchConfig = {
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
        return stitchConfig;
    }

    private createCueCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): CueCanvasConfig {
        const cueConfig = {
            columns,
            rows,
            dotsSpacing: dotsSpacing,
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
        return cueConfig;
    }
}