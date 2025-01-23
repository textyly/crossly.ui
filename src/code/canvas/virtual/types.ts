import { Position } from "../input/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { StitchDot, StitchLine, Link, ICanvas, GridDot, GridLine } from "../types.js";

export type GridState = GridCanvasConfig;
export type StitchState = StitchCanvasConfig;
export type CueState = CueCanvasConfig;

export type ZoomItemConfig = { value: number; zoomStep: number; };
export type DotConfig = { color: string; radius: ZoomItemConfig; };
export type LineConfig = { color: string; width: ZoomItemConfig; };
export type DotsConfig = DotConfig & { columns: number, rows: number, spacing: ZoomItemConfig; };

export type GridCanvasConfig = {
    dots: DotsConfig;
    lines: LineConfig;
}

export type StitchCanvasConfig = {
    dots: DotConfig;
    lines: LineConfig;
}

export type CueCanvasConfig = {
    dot: DotConfig
    link: LineConfig;

}

export interface IVirtualCanvas<TConfig> extends ICanvas {
    draw(config: TConfig): void;
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
    onDrawFrontDot(listener: DrawStitchDotListener): VoidUnsubscribe;
    onDrawBackDot(listener: DrawStitchDotListener): VoidUnsubscribe;

    onDrawFrontLine(listener: DrawStitchLineListener): VoidUnsubscribe;
    onDrawBackLine(listener: DrawStitchLineListener): VoidUnsubscribe;
}

export interface ICueCanvas extends IVirtualCanvas<CueCanvasConfig> {
    onHoverDot(listener: HoverDotListener): VoidUnsubscribe;
    onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe;

    onDrawLink(listener: DrawLinkListener): VoidUnsubscribe;
    onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe;
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

export type DrawLinkEvent = { link: Link };
export type DrawLinkListener = Listener<DrawLinkEvent>;

export type RemoveLinkEvent = { link: Link };
export type RemoveLinkListener = Listener<RemoveLinkEvent>;

export type HoverGridDotEvent = { dot: GridDot };
export type HoverDotListener = Listener<HoverGridDotEvent>;

export type UnhoverGridDotEvent = { dot: GridDot };
export type UnhoverDotListener = Listener<UnhoverGridDotEvent>;