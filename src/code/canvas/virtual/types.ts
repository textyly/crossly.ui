import { Listener, VoidUnsubscribe } from "../../types.js";
import { Dot, Line, Link, DotsConfig, ICanvas } from "../types.js";

export type DotsState = DotsConfig;

export interface IDotVirtualCanvas extends ICanvas {
    draw(config: Readonly<DotsConfig>): void;

    getDotById(id: string): Dot | undefined;
    getDotByCoordinates(x: number, y: number): Dot | undefined;

    onDrawDot(listener: DrawDotListener): VoidUnsubscribe;
}

export interface IDotMatcher {
    match(mouseX: number, mouseY: number, dotX: number, dotY: number, dotRadius: number): boolean;
}

export interface ILineVirtualCanvas extends ICanvas {
    onDrawLine(listener: DrawLineListener): VoidUnsubscribe;
}

export interface ICueVirtualCanvas extends ICanvas {
    onDrawLink(listener: DrawLinkListener): VoidUnsubscribe;
    onRemoveLink(listener: RemoveLinkListener): VoidUnsubscribe;
    onHoverDot(listener: HoverDotListener): VoidUnsubscribe;
    onUnhoverDot(listener: UnhoverDotListener): VoidUnsubscribe;
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