export type DotsSpacingConfig = {
    space: number;
    minSpace: number;
    spaceZoomStep: number;
};

export type DotsConfig = {
    color: string;
    radius: number;
    minRadius: number;
    radiusZoomStep: number;
    hidden: {
        enabled: boolean;
    }
};

export type ThreadsConfig = {
    name: string,
    color: string;
    width: number;
    minWidth: number;
    widthZoomStep: number;
};

export type CanvasConfig = {
    rows: number;
    columns: number;
    dotsSpacing: DotsSpacingConfig;
};

export type InputCanvasConfig = {
    ignoreMoveUntil: number;
    ignoreZoomUntil: number; // only touch zoom related 
};

export type FabricCanvasConfig = CanvasConfig & {
    name: string,
    color: string;
    dots: DotsConfig;
    threads: ThreadsConfig;
};

export type StitchCanvasConfig = CanvasConfig & {
    threads: ThreadsConfig;
};

export type CueCanvasConfig = CanvasConfig & {
    dots: Omit<DotsConfig, "hidden">;
    threads: ThreadsConfig;
};

export type CrosslyCanvasConfig = {
    input: InputCanvasConfig;
    fabric: FabricCanvasConfig;
    stitch: StitchCanvasConfig;
    cue: CueCanvasConfig;
};