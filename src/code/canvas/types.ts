import { Listener, VoidUnsubscribe } from "../types";

export type Id = string;
export type Dot = { id: Id, x: number, y: number, radius: number, visibility: DotVisibility };
export type Line = { from: Dot, to: Dot, side: CanvasSide };
export type Link = { id: Id, from: Dot, to: Dot, side: CanvasSide };

export type Size = { width: number, height: number };
export type RadiusConfig = { value: number, step: number };
export type SpacingConfig = { value: number, step: number };
export type DotsConfig = { dotsX: number, dotsY: number, radius: RadiusConfig, spacing: SpacingConfig };

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get size(): Size;
    set size(value: Size);

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    draw(dotsConfig: DotsConfig): void;
}

export enum CanvasSide {
    Front,
    Back,
    Default = Back,
}

export enum DotVisibility {
    Visible,
    Invisible,
    Default = Visible,
}

export type SizeChangeEvent = { size: Size };
export type SizeChangeListener = Listener<SizeChangeEvent>;