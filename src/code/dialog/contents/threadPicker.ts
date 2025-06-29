import { DialogContentBase } from "./base.js";
import html from "../../utilities.ts/html.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { Listener, VoidListener, VoidUnsubscribe } from "../../types.js";
import { IThreadPickerContent, PickThreadEvent, PickThreadListener } from "../types.js";

export class ThreadPickerContent extends DialogContentBase implements IThreadPickerContent {
    private messaging: IMessaging1<PickThreadEvent>;

    private readonly gradientGrid: Element;
    private readonly canvas: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;
    private readonly slider: HTMLInputElement;
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

        this.canvas = html.getById(this.dialogContent, "thread-picker-palette-canvas");
        this.canvasContext = this.canvas.getContext("2d")!;
        this.slider = html.getById(this.dialogContent, "hue-slider");
        this.gradientGrid = html.getById(this.dialogContent, "thread-picker-gradient-grid");
        this.selectedThread = html.getById(this.dialogContent, "selected-thread");
        this.addThreadButton = html.getById(this.dialogContent, "add-thread");

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
                this.gradientGrid.appendChild(swatch);
            }
        }
    }

    private generatePalette(hue: any): void {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const baseColor = `hsl(${hue}, 100%, 50%)`;

        // Horizontal: saturation
        const satGrad = this.canvasContext.createLinearGradient(0, 0, width, 0);
        satGrad.addColorStop(0, "white");
        satGrad.addColorStop(1, baseColor);

        this.canvasContext.fillStyle = satGrad;
        this.canvasContext.fillRect(0, 0, width, height);

        // Vertical: lightness
        const lightGrad = this.canvasContext.createLinearGradient(0, 0, 0, height);
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
        swatch.className = "thread-picker-swatch";
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