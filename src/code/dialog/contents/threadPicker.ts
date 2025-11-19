import { DialogContentBase } from "./base.js";
import html from "../../utilities.ts/html.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { IThreadPickerContent, PickThreadEvent, PickThreadListener } from "../types.js";

export class ThreadPickerContent extends DialogContentBase implements IThreadPickerContent {
    private messaging: IMessaging1<PickThreadEvent>;

    private readonly canvasId = "thread-picker-palette-canvas";
    private readonly sliderId = "hue-slider";
    private readonly gridId = "thread-picker-gradient-grid";
    private readonly selectedThreadId = "selected-thread";
    private readonly addThreadButtonId = "add-thread";
    private readonly swatchClassName = "thread-picker-swatch";

    private readonly canvas: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;
    private readonly slider: HTMLInputElement;
    private readonly grid: Element;
    private readonly swatches: Array<Element>;
    private readonly selectedThread: HTMLInputElement;
    private readonly addThreadButton: HTMLButtonElement;

    private slideListener: VoidListener;
    private canvasClickListener: Listener<PointerEvent>;
    private addThreadButtonListener: VoidListener;
    private readonly swatchListeners: Array<Listener<Event>>;

    constructor(document: Document, dialogOverlay: HTMLElement) {
        super(ThreadPickerContent.name, document, dialogOverlay, "thread-picker-content");

        this.messaging = new Messaging1();
        this.swatches = [];

        this.canvas = html.getById(this.dialogContent, this.canvasId);
        this.canvasContext = this.canvas.getContext("2d")!;
        this.slider = html.getById(this.dialogContent, this.sliderId);
        this.grid = html.getById(this.dialogContent, this.gridId);
        this.selectedThread = html.getById(this.dialogContent, this.selectedThreadId);
        this.addThreadButton = html.getById(this.dialogContent, this.addThreadButtonId);

        this.slideListener = () => { };
        this.canvasClickListener = () => { };
        this.addThreadButtonListener = () => { };
        this.swatchListeners = [];

        this.generateGrid();
        this.generatePalette(this.slider.value);
        this.pickColor(0, 0);

        this.startListening();
    }

    public onPickThread(listener: PickThreadListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public override dispose(): void {
        this.ensureAlive();
        this.stopListening();
        super.dispose();
    }

    private generateGrid(): void {
        const hueSteps = 8;
        const lightnessSteps = 8;

        for (let col = 0; col < hueSteps; col++) {
            const hue = Math.round((360 / hueSteps) * col);
            for (let row = 0; row < lightnessSteps; row++) {
                const lightness = 90 - row * (70 / (lightnessSteps - 1));
                const swatch = this.createSwatch(hue, 100, lightness);
                this.grid.appendChild(swatch);
            }
        }
    }

    private hexToHsl(hex: string): { h: number; s: number; l: number } {
        // Remove # if present
        hex = hex.replace(/^#/, "");

        // Parse hex values
        const r: number = parseInt(hex.substring(0, 2), 16) / 255;
        const g: number = parseInt(hex.substring(2, 4), 16) / 255;
        const b: number = parseInt(hex.substring(4, 6), 16) / 255;

        const max: number = Math.max(r, g, b);
        const min: number = Math.min(r, g, b);
        let h: number = 0;
        let s: number = 0;
        const l: number = (max + min) / 2;

        if (max !== min) {
            const d: number = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    private generatePalette(color: string): void {
        const width: number = this.canvas.width;
        const height: number = this.canvas.height;

        let hue: number;
        // Check if color is a hex color (starts with #)
        if (color.startsWith("#")) {
            const hsl: { h: number; s: number; l: number } = this.hexToHsl(color);
            hue = hsl.h;
        } else {
            // Assume it's a hue value
            hue = parseInt(color, 10);
        }

        const baseColor: string = `hsl(${hue}, 100%, 50%)`;

        // Horizontal: saturation
        const satGrad: CanvasGradient = this.canvasContext.createLinearGradient(0, 0, width, 0);
        satGrad.addColorStop(0, "white");
        satGrad.addColorStop(1, baseColor);

        this.canvasContext.fillStyle = satGrad;
        this.canvasContext.fillRect(0, 0, width, height);

        // Vertical: lightness
        const lightGrad: CanvasGradient = this.canvasContext.createLinearGradient(0, 0, 0, height);
        lightGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        lightGrad.addColorStop(1, "black");

        this.canvasContext.fillStyle = lightGrad;
        this.canvasContext.fillRect(0, 0, width, height);
    }

    private hslToHex(h: number, s: number, l: number): string {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;

        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, "0");
        };

        return `#${f(0)}${f(8)}${f(4)}`;
    }

    private createSwatch(h: number, s: number, l: number): HTMLDivElement {
        const hex = this.hslToHex(h, s, l);

        const swatch = document.createElement("div");
        swatch.className = this.swatchClassName;
        swatch.style.backgroundColor = hex;
        swatch.title = hex;

        this.swatches.push(swatch);
        this.subscribeSwatch(swatch);

        return swatch;
    }

    private pickColor(x: number, y: number): void {
        const imageData = this.canvasContext.getImageData(x, y, 1, 1).data;
        const [r, g, b] = imageData;
        const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, "0")).join("")}`;
        this.selectedThread.value = hex;
    }

    private handleChangeSlider(): void {
        this.generatePalette(this.slider.value);
    }

    private handleClickCanvas(event: PointerEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.pickColor(x, y);
    }

    private handleClickSwatch(event: Event): void {
        const element = event.target as HTMLInputElement;
        const color = element.title;
        this.selectedThread.value = color;
        
        // Update the slider to match the swatch's hue
        const hsl = this.hexToHsl(color);
        this.slider.value = hsl.h.toString();
        
        // Regenerate the palette based on the swatch color
        this.generatePalette(color);
    }

    private handleAddThread(): void {
        const color = this.selectedThread.value;
        this.invokePickThread(color);
        super.hide();
    }

    private subscribeSwatch(swatch: HTMLDivElement): void {
        const swatchListener = this.handleClickSwatch.bind(this);
        swatch.addEventListener("click", swatchListener);
        this.swatchListeners.push(swatchListener);
    }

    private startListening(): void {
        this.slideListener = this.handleChangeSlider.bind(this);
        this.slider.addEventListener("input", this.slideListener);

        this.canvasClickListener = this.handleClickCanvas.bind(this);
        this.canvas.addEventListener("pointerdown", this.canvasClickListener);

        this.addThreadButtonListener = this.handleAddThread.bind(this);
        this.addThreadButton.addEventListener("click", this.addThreadButtonListener);
    }

    private stopListening(): void {
        this.slider.removeEventListener("input", this.slideListener);
        this.canvas.removeEventListener("pointerdown", this.canvasClickListener);
        this.addThreadButton.removeEventListener("click", this.addThreadButtonListener);

        for (let index = 0; index < this.swatches.length; index++) {
            const swatch = this.swatches[index];
            const swatchListener = this.swatchListeners[index];
            swatch.removeEventListener("click", swatchListener);
        }
    }

    private invokePickThread(color: string): void {
        const thread = { name: color, color, width: 12 }; //TODO: !!!
        const event = { thread };
        this.messaging.sendToChannel1(event);
    }
}