import { Position } from "./input/types.js";
import { Listener, VoidUnsubscribe } from "../types";
import { CrosslyCanvasConfig } from "../config/types.js";
import { IThreadPath } from "./utilities/arrays/types.js";
import { CueThreadArray } from "./utilities/arrays/thread/cue.js";
import { ChangeFabricListener, ChangeStitchPatternListener } from "./virtual/types.js";

export type Bounds = { left: number, top: number, width: number, height: number };

export type DotIndex = { dotX: number, dotY: number };
export type BoundsIndexes = { leftTop: DotIndex, rightTop: DotIndex, leftBottom: DotIndex, rightBottom: DotIndex };

export type Id = number;
export type Dot = Position;
export type CueDot = Dot & { id: Id };
export type CueSegment = { id: Id, from: Dot, to: Dot, width: number, color: string };
export type CuePattern = Array<CueThreadArray>;
export type StitchSegment = { from: Dot, to: Dot, width: number, color: string };
export type StitchPattern = Array<IThreadPath>;

export interface IDisposable {
    dispose(): void;
}

export interface ICanvas extends IDisposable {
    get bounds(): Bounds;
    set bounds(value: Bounds);

    onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe;
}

export interface ICrosslyCanvas extends ICanvas {
    get config(): Readonly<CrosslyCanvasConfig>;

    draw(): void;

    onChangeFabric(listener: ChangeFabricListener): VoidUnsubscribe;
    onChangeStitchPattern(listener: ChangeStitchPatternListener): VoidUnsubscribe;
}

export interface ICrosslyCanvasFacade extends ICrosslyCanvas {
    useNewThread(color: string, width: number): void;
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