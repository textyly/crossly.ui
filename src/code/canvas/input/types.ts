import { ICanvas } from "../types";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types";

export type CanvasEvent = { type: CanvasEventType, event?: any };
export type ActiveTouches = { currentDistance: number };

export interface IInputCanvas extends ICanvas {
    onMoveStart(listener: MoveStartListener): VoidUnsubscribe;
    onMove(listener: MoveListener): VoidUnsubscribe;
    onMoveStop(listener: MoveStopListener): VoidUnsubscribe;

    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;

    onPointerUp(listener: PointerUpListener): VoidUnsubscribe;
    onPointerMove(listener: PointerMoveListener): VoidUnsubscribe;

    onUndo(listener: VoidListener): VoidUnsubscribe;
}

export interface ITouchInput extends ICanvas {
    get inZoomMode(): boolean;

    subscribe(): void;

    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe
}

export interface IMoveInput extends ICanvas {
    get inMoveMode(): boolean;

    subscribe(): void;

    onMoveStart(listener: MoveStartListener): VoidUnsubscribe;
    onMove(listener: MoveListener): VoidUnsubscribe;
    onMoveStop(listener: MoveStopListener): VoidUnsubscribe;
}

export enum CanvasEventType {
    WheelChange = "wheel",
    ZoomIn = "zoomin",
    ZoomOut = "zoomout",

    MoveStart = "movestart",
    Move = "move",
    MoveStop = "movestop",

    PointerMove = "pointermove",
    PointerDown = "pointerdown",
    PointerUp = "pointerup",
    PointerCancel = "pointercancel",

    KeyDown = "keydown",

    TouchStart = "touchstart",
    TouchEnd = "touchend",
    TouchMove = "touchmove",
    TouchCancel = "touchcancel"
}

export type Position = { x: number, y: number };
export type PositionEvent = { position: Position };

export type PointerMoveEvent = PositionEvent;
export type PointerMoveListener = Listener<PointerMoveEvent>;

export type PointerUpEvent = PositionEvent;
export type PointerUpListener = Listener<PointerUpEvent>;

export type PointerDownEvent = PositionEvent;
export type PointerDownListener = Listener<PointerDownEvent>;

export type ZoomInEvent = { currentPosition: Position };
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = { currentPosition: Position };
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MoveStartEvent = { previousPosition: Position, currentPosition: Position };
export type MoveStartListener = Listener<MoveStartEvent>;

export type MoveEvent = { previousPosition: Position, currentPosition: Position };
export type MoveListener = Listener<MoveEvent>;

export type MoveStopEvent = PositionEvent;
export type MoveStopListener = Listener<MoveStopEvent>;

export type PointerEventHandler = Listener<PointerEvent>;
export type TouchEventHandler = Listener<TouchEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;
export type KeyDownEventHandler = Listener<KeyboardEvent>;