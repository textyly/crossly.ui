import { Position } from "../input/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { StitchDot, StitchLine, CueLine, ICanvas, GridDot, GridLine, CueDot } from "../types.js";

export type GridState = GridCanvasConfig;

export type ZoomItemConfig = { value: number; zoomStep: number; };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type LineConfig = { color: string; width: ZoomItemConfig; };
export type SpacingConfig = ZoomItemConfig;

export type GridCanvasConfig = {
    columns: number;
    rows: number;
    spacing: SpacingConfig;
    dot: DotConfig;
    line: LineConfig;
}

export type StitchCanvasConfig = {
    dot: DotConfig;
    line: LineConfig;
}

export type CueCanvasConfig = {
    dot: DotConfig
    line: LineConfig;
}

export interface IVirtualCanvas<TConfig> extends ICanvas {
    get config(): TConfig;

    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
}


export interface IGridCanvas extends IVirtualCanvas<GridCanvasConfig> {
    getDotById(id: string): GridDot | undefined;
    getDotByPosition(position: Position): GridDot | undefined;

    onDrawVisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;
    onDrawInvisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;

    onDrawVisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
    onDrawInvisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas<StitchCanvasConfig> {
    get dotColor(): string;
    set dotColor(color: string);

    get dotRadius(): number;
    set dotRadius(radius: number);

    get lineColor(): string;
    set lineColor(color: string);

    get lineWidth(): number;
    set lineWidth(width: number);

    onDrawFrontDot(listener: DrawStitchDotListener): VoidUnsubscribe;
    onDrawBackDot(listener: DrawStitchDotListener): VoidUnsubscribe;

    onDrawFrontLine(listener: DrawStitchLineListener): VoidUnsubscribe;
    onDrawBackLine(listener: DrawStitchLineListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas<CueCanvasConfig> {
    get dotColor(): string;
    set dotColor(color: string);

    get dotRadius(): number;
    set dotRadius(radius: number);

    get lineColor(): string;
    set lineColor(color: string);

    get lineWidth(): number;
    set lineWidth(width: number);

    onHoverDot(listener: HoverCueDotListener): VoidUnsubscribe;
    onUnhoverDot(listener: UnhoverCueListener): VoidUnsubscribe;

    onDrawFrontLine(listener: DrawCueLineListener): VoidUnsubscribe;
    onRemoveFrontLine(listener: RemoveCueLineListener): VoidUnsubscribe;

    onDrawBackLine(listener: DrawCueLineListener): VoidUnsubscribe;
    onRemoveBackLine(listener: RemoveCueLineListener): VoidUnsubscribe;
}

export interface IDotMatcher {
    match(dot: GridDot, position: Position): boolean;
}

export type DrawStitchDotEvent = { dot: StitchDot };
export type DrawStitchDotListener = Listener<DrawStitchDotEvent>;

export type DrawGridDotEvent = { dot: GridDot };
export type DrawGridDotListener = Listener<DrawGridDotEvent>;

export type DrawStitchLineEvent = { line: StitchLine };
export type DrawStitchLineListener = Listener<DrawStitchLineEvent>;

export type DrawGridLineEvent = { line: GridLine };
export type DrawGridLineListener = Listener<DrawGridLineEvent>;

export type DrawCueLineEvent = { line: CueLine };
export type DrawCueLineListener = Listener<DrawCueLineEvent>;

export type RemoveCueLineEvent = { line: CueLine };
export type RemoveCueLineListener = Listener<RemoveCueLineEvent>;

export type HoverCueDotEvent = { dot: CueDot };
export type HoverCueDotListener = Listener<HoverCueDotEvent>;

export type UnhoverCueDotEvent = { dot: CueDot };
export type UnhoverCueListener = Listener<UnhoverCueDotEvent>;