import { Position } from "./input/types.js";
import { Listener, VoidUnsubscribe } from "../types";
import { StitchThread } from "./utilities/arrays/thread/stitch.js";

export type Bounds = { left: number, top: number, width: number, height: number };

export type DotIndex = { dotX: number, dotY: number };
export type BoundsIndexes = { leftTop: DotIndex, rightTop: DotIndex, leftBottom: DotIndex, rightBottom: DotIndex };

export type Id = number;
export type Dot = Position;
export type CueDot = Dot & { id: Id };
export type CueThread = { id: Id, from: Dot, to: Dot, width: number, color: string };
export type StitchSegment = { from: Dot, to: Dot, width: number, color: string };
export type StitchPattern = Array<StitchThread>;

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get bounds(): Bounds;
    set bounds(value: Bounds);

    onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    draw(): void;
}

export interface ICrosslyCanvasFacade extends ICrosslyCanvas {
    setThread(color: string, width: number): void;
    setThreadColor(color: string): void;
    setThreadWidth(width: number): void;
}

export enum CanvasSide {
    Front,
    Back,
}

export enum Visibility {
    Visible,
    Invisible,
}

export type BoundsChangeEvent = { bounds: Bounds };
export type BoundsChangeListener = Listener<BoundsChangeEvent>;