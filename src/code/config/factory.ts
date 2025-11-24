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
            space: 22,
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
                radius: 1.6, // px
                minRadius: 0.6, // px
                radiusZoomStep: 0.16, // px, TODO: must become %
                hidden: {
                    enabled: true
                }
            },
            threads: {
                name: "Aida 14",
                color: "#d2d4d2",
                width: 1.6, // px
                minWidth: 0.6, // px
                widthZoomStep: 0.16 // px , TODO: must become %
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
                width: 10, // px
                minWidth: 1, // px
                widthZoomStep: 10 // %
            }
        };
        return stitchConfig;
    }

    private createCueCanvasConfig(columns: number, rows: number, dotsSpacing: DotsSpacingConfig): CueCanvasConfig {
        const cueConfig = {
            columns, rows, dotsSpacing,
            dots: {
                radius: 12, // px
                minRadius: 1, // px
                radiusZoomStep: 1 // px , TODO: must become % and sync with fabric
            },
            threads: {
                name: "DMC 321",
                color: "#111e6a",
                width: 10, // px
                minWidth: 1, // px
                widthZoomStep: 10 // %
            }
        };
        return cueConfig;
    }
}