import { Position } from "../input/types.js";
import { Listener, VoidUnsubscribe } from "../../types.js";
import { StitchDot, StitchLine, Link, CanvasConfig, ICanvas, GridDot, GridLine } from "../types.js";

export type GridState = CanvasConfig;

export interface IGridCanvas extends ICanvas {
    draw(config: Readonly<CanvasConfig>): void;

    getDotById(id: string): GridDot | undefined;
    getDotByPosition(position: Position): GridDot | undefined;

    onDrawVisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;
    onDrawInvisibleDot(listener: DrawGridDotListener): VoidUnsubscribe;

    onDrawVisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
    onDrawInvisibleLine(listener: DrawGridLineListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends ICanvas {
    onDrawFrontDot(listener: DrawStitchDotListener): VoidUnsubscribe;
    onDrawBackDot(listener: DrawStitchDotListener): VoidUnsubscribe;

    onDrawFrontLine(listener: DrawStitchLineListener): VoidUnsubscribe;
    onDrawBackLine(listener: DrawStitchLineListener): VoidUnsubscribe;
}

export interface ICueCanvas extends ICanvas {
    onDrawLink(listener: DrawLinkListener): VoidUnsubscribe;
    onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe;

    onHoverDot(listener: HoverDotListener): VoidUnsubscribe;
    onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe;
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