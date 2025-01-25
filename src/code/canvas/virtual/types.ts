import { Position } from "../input/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { StitchDot, StitchLine, CueLine, ICanvas, GridDot, GridLine, CueDot } from "../types.js";

export type ZoomItemConfig = { value: number; zoomStep: number; };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type LineConfig = { color: string; width: ZoomItemConfig; };
export type SpacingConfig = ZoomItemConfig;

export type CanvasConfig = {
    dot: DotConfig;
    line: LineConfig;
}

export type GridCanvasConfig = CanvasConfig & {
    columns: number;
    rows: number;
    spacing: SpacingConfig;
}

export type StitchCanvasConfig = CanvasConfig;
export type CueCanvasConfig = CanvasConfig;

export interface IVirtualCanvas<TConfig> extends ICanvas {
    get config(): TConfig;

    get dotColor(): string;
    set dotColor(value: string);

    get dotRadius(): number;
    set dotRadius(value: number);

    get lineColor(): string;
    set lineColor(value: string);

    get lineWidth(): number;
    set lineWidth(value: number);

    draw(): void;
    onRedraw(listener: VoidListener): VoidUnsubscribe;
}


export interface IGridCanvas extends IVirtualCanvas<GridCanvasConfig> {
    get spacing(): number;
    set spacing(value: number);

    get rows(): number;
    set rows(value: number);

    get columns(): number;
    set columns(value: number);

    getDotById(id: string): GridDot | undefined;
    getDotByPosition(position: Position): GridDot | undefined;

    onDrawVisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;
    onDrawInvisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;

    onDrawVisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
    onDrawInvisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends IVirtualCanvas<StitchCanvasConfig> {
    onDrawFrontDot(listener: DrawStitchDotListener): VoidUnsubscribe;
    onDrawBackDot(listener: DrawStitchDotListener): VoidUnsubscribe;

    onDrawFrontLine(listener: DrawStitchLineListener): VoidUnsubscribe;
    onDrawBackLine(listener: DrawStitchLineListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas<CueCanvasConfig> {
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