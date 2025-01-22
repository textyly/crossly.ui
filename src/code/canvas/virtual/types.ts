import { Position } from "../input/types.js";
import { Listener, VoidUnsubscribe } from "../../types.js";
import { Dot, Line, Link, CanvasConfig, ICanvas } from "../types.js";

export type DotsState = CanvasConfig;

export interface IGridCanvas extends ICanvas {
    draw(config: Readonly<CanvasConfig>): void;

    getDotById(id: string): Dot | undefined;
    getDotByPosition(mouse: Position): Dot | undefined;

    onDrawDot(listener: DrawDotListener): VoidUnsubscribe;
}

export interface IStitchCanvas extends ICanvas {
    onDrawDot(listener: DrawDotListener): VoidUnsubscribe;
    onDrawLine(listener: DrawLineListener): VoidUnsubscribe;
}

export interface ICueCanvas extends ICanvas {
    onDrawLink(listener: DrawLinkListener): VoidUnsubscribe;
    onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe;
    onHoverDot(listener: HoverDotListener): VoidUnsubscribe;
    onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe;
}

export interface IDotMatcher {
    match(dot: Dot, mouse: Position): boolean;
}

export type DrawDotEvent = { dot: Dot };
export type DrawDotListener = Listener<DrawDotEvent>;

export type DrawLineEvent = { line: Line };
export type DrawLineListener = Listener<DrawLineEvent>;

export type DrawLinkEvent = { link: Link };
export type DrawLinkListener = Listener<DrawLinkEvent>;

export type RemoveLinkEvent = { link: Link };
export type RemoveLinkListener = Listener<RemoveLinkEvent>;

export type HoverDotEvent = { dot: Dot };
export type HoverDotListener = Listener<HoverDotEvent>;

export type UnhoverDotEvent = { dot: Dot };
export type UnhoverDotListener = Listener<UnhoverDotEvent>;