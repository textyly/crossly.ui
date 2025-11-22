import {
    CueCanvasConfig,
    InputCanvasConfig,
    DotsSpacingConfig,
    StitchCanvasConfig,
    FabricCanvasConfig,
    CrosslyCanvasConfig,
} from "../config/types.js";

export class ConfigFactory {
    public create(): CrosslyCanvasConfig {
        const columns = 42;
        const rows = 42;

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
            space: 24,
            minSpace: 2,
            spaceZoomStep: 2
        };
        return dotsSpacing;
         
    }

    private createFabricCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): FabricCanvasConfig {
        const fabricConfig = {
            name: "Aida 14",
            columns, rows, dotsSpacing,
            color: "#f2f2f2",
            dots: {
                color: "#9fa19f",
                radius: 1.4,
                minRadius: 0.6,
                radiusZoomStep: 0.1,
                hidden: {
                    enabled: true
                }
            },
            threads: {
                name: "Aida 14",
                color: "#d2d4d2",
                width: 1.4,
                minWidth: 0.8,
                widthZoomStep: 0.1
            }
        };
        return fabricConfig;
    }

    private createStitchCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): StitchCanvasConfig {
        const stitchConfig = {
            columns, rows, dotsSpacing,
            threads: {
                name: "DMC 321",
                color: "#111e6a",
                width: 12,
                minWidth: 1,
                widthZoomStep: 1
            }
        };
        return stitchConfig;
    }

    private createCueCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): CueCanvasConfig {
        const cueConfig = {
            columns, rows, dotsSpacing,
            dots: {
                color: "#615858",
                radius: 12,
                minRadius: 1,
                radiusZoomStep: 1
            },
            threads: {
                name: "DMC 321",
                color: "#111e6a",
                width: 12,
                minWidth: 1,
                widthZoomStep: 1
            }
        };
        return cueConfig;
    }
}