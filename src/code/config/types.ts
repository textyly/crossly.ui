export type DotsSpacingConfig = {
    space: number;
    minSpace: number;
    spaceZoomStep: number;
};

export type DotConfig = {
    color: string;
    radius: number;
    minRadius: number;
    radiusZoomStep: number;
};

export type ThreadConfig = {
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
    dot: DotConfig;
    thread: ThreadConfig;
};

export type StitchCanvasConfig = CanvasConfig & {
    thread: ThreadConfig;
};

export type CueCanvasConfig = CanvasConfig & {
    dot: DotConfig;
    thread: ThreadConfig;
};

export type CrosslyCanvasConfig = {
    input: InputCanvasConfig;
    fabric: FabricCanvasConfig,
    stitch: StitchCanvasConfig,
    cue: CueCanvasConfig
};