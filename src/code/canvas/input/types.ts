import { ICanvas, SizeChangeListener } from "../types";
import { Listener, VoidUnsubscribe } from "../../types";

export type CanvasEvent = { type: CanvasEventsType, value?: Position };

export interface IInputCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;

    onPointerMove(listener: PointerMoveListener): VoidUnsubscribe;
    onPointerUp(listener: PointerUpListener): VoidUnsubscribe;
    onPointerHoldingDown(listener: PointerDownListener): VoidUnsubscribe;

    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
}

export enum CanvasEventsType {
    WheelChange = "wheel",
    ZoomIn = "zoomin",
    ZoomOut = "zoomout",
    PointerMove = "pointermove",
    PointerDown = "pointerdown",
    PointerUp = "pointerup",
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

export type PointerEventHandler = Listener<PointerEvent>;
export type WheelChangeHandler = Listener<WheelEvent>;