import { ICanvas, Size } from "../types";
import { Listener, VoidUnsubscribe } from "../../types";

// #region types 
export type SizeChangeEvent = Size;
export type SizeChangeListener = Listener<Size>;

export type Position = { x: number, y: number };
export type PositionEvent = { position: Position };
export type MouseMoveEvent = PositionEvent;
export type MouseMoveListener = Listener<MouseMoveEvent>

export type MouseLeftButtonDownEvent = PositionEvent;
export type MouseLeftButtonDownListener = Listener<MouseLeftButtonDownEvent>;

export type ZoomInEvent = {};
export type ZoomInListener = Listener<ZoomInEvent>;

export type ZoomOutEvent = {};
export type ZoomOutListener = Listener<ZoomOutEvent>;

export type MouseEventHandler = (event: MouseEvent) => void
export type WheelChangeHandler = (event: WheelEvent) => void;


// #endregion

// #region interfaces

export interface ITransparentCanvas extends ICanvas {
    onZoomIn(listener: ZoomInListener): VoidUnsubscribe;
    onZoomOut(listener: ZoomOutListener): VoidUnsubscribe;
    onSizeChange(listener: SizeChangeListener): VoidUnsubscribe;
    onMouseMove(listener: MouseMoveListener): VoidUnsubscribe;
    onMouseLeftButtonDown(listener: MouseLeftButtonDownListener): VoidUnsubscribe;
}

// #endregion

// #region enums

export enum CanvasEventType {
    ZoomIn = "zoom-in",
    ZoomOut = "zoom-out",
    MouseMove = "mouse-move",
    MouseLeftButtonDown = "mouse-left-button-down"
}

// #endregion
