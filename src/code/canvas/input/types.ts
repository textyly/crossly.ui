import { ICanvas } from "../types";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types";


export type CanvasEvent = { type: CanvasEventType, event?: any };
export type ActiveTouches = { currentDistance: number };

export interface IInputCanvas extends ICanvas {
    onMoveStart(listener: VoidListener): VoidUnsubscribe;
    onMove(listener: MoveListener): VoidUnsubscribe;
    onMoveStop(listener: VoidListener): VoidUnsubscribe;

    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;

    onPointerUp(listener: PointerUpListener): VoidUnsubscribe;
    onPointerMove(listener: PointerMoveListener): VoidUnsubscribe;
    // TODO: pointer leave
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

    onMoveStart(listener: VoidListener): VoidUnsubscribe;
    onMove(listener: MoveListener): VoidUnsubscribe;
    onMoveStop(listener: VoidListener): VoidUnsubscribe;
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

export type ZoomInEvent = {};
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = {};
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MoveEvent = { previousPosition: Position, currentPosition: Position };
export type MoveListener = Listener<MoveEvent>;

export type PointerEventHandler = Listener<PointerEvent>;
export type TouchEventHandler = Listener<TouchEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;