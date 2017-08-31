/**
 * Import decorators and services from angular
 */
import {ChangeDetectorRef, Component, HostListener, OnInit, ViewEncapsulation} from "@angular/core";
import {LayerMode, LayerModeType, PictureLayer} from "../models/Picture";
import {DomSanitizer} from "@angular/platform-browser";
import {TimerObservable} from "rxjs/observable/TimerObservable";
import {Subscription} from "rxjs/Subscription";

function shallowEqual(a, b) {
    let ka = 0;
    let kb = 0;

    for (let key in a) {
        if (
            a.hasOwnProperty(key) &&
            a[key] !== b[key]
        ) return false;

        ka++;
    }

    for (let key in b) {
        if (b.hasOwnProperty(key)) kb++;
    }

    return ka === kb;
}

/*
 * App Component
 * Top Level Component
 */
@Component({
    // The selector is what angular internally uses
    selector: 'ae-app', // <app></app>
    styleUrls: ['./app.theme.scss'],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="mat-body mat-typography" [class.empty]="empty" [class.m2app-dark]="isDarkTheme"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event)">
            <main>
                <md-toolbar>
                    <span><md-slide-toggle (change)="isDarkTheme = !isDarkTheme" [checked]="isDarkTheme"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slider min="0" max="100" step="0.5" [(ngModel)]="threshold"></md-slider></span>
                    <span><md-slide-toggle (change)="grayscale = !grayscale" [checked]="grayscale"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slide-toggle (change)="blinking = !blinking" [checked]="blinking"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slider min="1" max="30" step="1" [(ngModel)]="blinkInterval"></md-slider></span>
                    <span>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="5"
                                   [(ngModel)]="left"/>                            
                        </md-input-container>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="5"
                                   [(ngModel)]="top"/>                            
                        </md-input-container>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="1"
                                   [(ngModel)]="perspective"/>
                        </md-input-container>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="1"
                                   [(ngModel)]="anglePerspective"/>
                        </md-input-container>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="1"
                                   [(ngModel)]="rotate"/>
                        </md-input-container>
                        <md-input-container>
                            <input mdInput type="number" (keydown)="$event.stopPropagation()" step="5"
                                   [(ngModel)]="width"/>
                        </md-input-container>
                    </span>
                    <span>
                        #{{activeLayer}}
                    </span>
                </md-toolbar>
                <div class="picture" [style.width]="maxWidth" [style.top]="topShift" [style.left]="leftShift"
                     [style.transform]="transformStyle" [class.hidden]="needBlink">
                    <div *ngIf="layers.length">
                        <picture [url]="mediaUrl" [mode]="mediaMode"></picture>
                    </div>
                </div>
            </main>
        </div>
    `
})
export class AppComponent implements OnInit {
    private tick: string;
    private subscription: Subscription;

    modeType: LayerModeType = LayerModeType.NORMAL;

    isFullscreen: boolean = false;

    //component initialization
    isDarkTheme: boolean = false;
    tickActive: boolean = false;
    blinking: boolean = false;
    grayscale: boolean = false;
    empty: boolean = false;

    threshold: number = 50;
    blinkInterval: number = 10;
    rotate: number = 0;
    perspective: number = 200;
    anglePerspective: number = -1;

    top: number = 390;
    left: number = 200;

    activeLayer: number = 0;
    layers: PictureLayer[] = [];

    width: number = 500;

    cachedMode: LayerMode;

    constructor(private sanitizer: DomSanitizer, private detector: ChangeDetectorRef) {
    }

    ngOnInit() {
        const remote = require('electron').remote;
        let timer = TimerObservable.create(2000, 700);
        this.subscription = timer.subscribe(t => {
            const tick = t % (this.getBlinkInterval() | 0);
            // console.log(tick, this.getBlinkInterval());
            this.tickActive = tick === 0;
        });
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    getBlinkInterval() {
        return this.blinkInterval;
    }

    get topShift() {
        return this.top + "px";
    }

    get needBlink() {
        return this.blinking && !this.tickActive;
    }

    get leftShift() {
        return this.left + "px";
    }

    get maxWidth() {
        return this.width + "px";
    }

    get transformStyle() {
        return this.sanitizer.bypassSecurityTrustStyle(`perspective(${this.perspective}px) rotate3d(1,0,0, ${this.anglePerspective}deg) rotate(${this.rotate}deg)`);
    }

    get media() {
        return this.layers[this.activeLayer];
    }

    get mediaUrl() {
        return this.layers[this.activeLayer].path;
    }

    get mediaMode(): LayerMode {
        const newMode = {
            type: this.modeType,
            thresholdValue: this.threshold,
            grayscale: this.grayscale,
            blinking: this.blinking,
            blinkInterval: this.blinkInterval,
        };
        if (!this.cachedMode || !shallowEqual(this.cachedMode, newMode)) {
            this.cachedMode = newMode;
        }
        return this.cachedMode;
    }

    onDrop(event: DragEvent) {
        if (event.dataTransfer.files && event.dataTransfer.files.length) {
            for (let file of Array.from(event.dataTransfer.files)) {
                if (["image/png", "image/jpeg"].indexOf(file.type) >= 0) {
                    const newLayer: PictureLayer = {
                        path: file['path'], // Electron adds this automatically
                        mode: {
                            type: this.modeType,
                            thresholdValue: this.threshold,
                            grayscale: this.grayscale,
                            blinking: this.blinking,
                            blinkInterval: this.blinkInterval,
                        } as LayerMode
                    };
                    this.layers = [...this.layers, newLayer];
                }
            }
        }
        event.preventDefault();
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        console.log(event.code);
        if (event.code === "KeyF") {
            const electron = require('electron');
            const w = electron.remote.getCurrentWindow();
            this.isFullscreen = !this.isFullscreen;
            w.setFullScreen(this.isFullscreen);
        }

        if (event.code === "KeyI") {
            this.isDarkTheme = !this.isDarkTheme;
        }

        if (event.code === "KeyS") {
            const electron = require('electron');
            electron.remote.dialog.showSaveDialog({
                filters: [{
                    extensions: "json",
                    name: "JSON"
                }]
            }, (filename: string) => {
                const fs = require('fs');
                try {
                    fs.writeFileSync(filename + ".json", JSON.stringify(this.exportData()), 'utf-8');
                } catch (e) {
                    alert('Failed to save!');
                }
            });
        }

        if (event.code === "KeyL") {
            const electron = require('electron');
            electron.remote.dialog.showOpenDialog({
                filters: [{
                    extensions: "json",
                    name: "JSON"
                }]
            }, (filePaths: string[]) => {
                const fs = require('fs');
                try {
                    const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));
                    this.importData(data);
                } catch (e) {
                    alert('Failed to load!');
                }
            });
        }

        if (event.code === "KeyG") {
            this.grayscale = !this.grayscale;
        }

        if (event.code === "KeyM") {
            if (this.modeType === LayerModeType.NORMAL) {
                this.modeType = LayerModeType.THRESHOLD;
            } else if (this.modeType === LayerModeType.THRESHOLD) {
                this.modeType = LayerModeType.THRESHOLD_INVERTED;
            } else {
                this.modeType = LayerModeType.NORMAL;
            }
        }

        if (event.code === "KeyB") {
            this.blinking = !this.blinking;
        }

        if (event.code === "Digit1") {
            this.threshold = 10;
        }

        if (event.code === "Digit2") {
            this.threshold = 20;
        }

        if (event.code === "Digit3") {
            this.threshold = 30;
        }

        if (event.code === "Digit4") {
            this.threshold = 40;
        }

        if (event.code === "Digit5") {
            this.threshold = 50;
        }

        if (event.code === "Digit6") {
            this.threshold = 60;
        }

        if (event.code === "Digit7") {
            this.threshold = 70;
        }

        if (event.code === "Digit8") {
            this.threshold = 80;
        }

        if (event.code === "Digit9") {
            this.threshold = 90;
        }

        if (event.code === "Digit0") {
            this.threshold = 100;
        }

        if (event.code === "Space" || event.code === "KeyE") {
            this.empty = !this.empty;
        }

        if (event.code === "ArrowLeft") {
            this.left -= 5;
        }

        if (event.code === "ArrowRight") {
            this.left += 5;
        }

        if (event.code === "ArrowUp") {
            this.top -= 5;
        }

        if (event.code === "ArrowDown") {
            this.top += 5;
        }

        if (event.code === "PageUp") {
            this.width -= 1;
        }

        if (event.code === "PageDown") {
            this.width += 1;
        }

        if (event.code === "Home") {
            this.anglePerspective -= 0.2;
        }

        if (event.code === "End") {
            this.anglePerspective += 0.2;
        }

        if (event.code === "Insert") {
            this.rotate -= 0.5;
        }

        if (event.code === "Delete") {
            this.rotate += 0.5;
        }

        if (event.code === "Equal") {
            this.threshold += 1;
        }

        if (event.code === "Minus") {
            this.threshold -= 1;
        }

        if (this.layers.length) {
            if (event.code === "BracketLeft") {
                this.saveToLayer();
                this.activeLayer -= 1;
                if (this.activeLayer < 0) {
                    this.activeLayer = this.layers.length - 1;
                }
                this.applyFromLayer();
            }

            if (event.code === "BracketRight") {
                this.saveToLayer();
                this.activeLayer += 1;
                if (this.activeLayer > this.layers.length - 1) {
                    this.activeLayer = 0;
                }
                this.applyFromLayer();
            }
        }
    }


    saveToLayer() {
        if (this.layers.length) {
            this.layers[this.activeLayer].mode = {
                ...this.layers[this.activeLayer].mode,
                grayscale: this.grayscale,
                thresholdValue: this.threshold,
                blinking: this.blinking,
                blinkInterval: this.blinkInterval,
                type: this.modeType,
            };
        }
    }

    applyFromLayer() {
        if (this.layers.length) {
            this.grayscale = this.layers[this.activeLayer].mode.grayscale;
            this.threshold = this.layers[this.activeLayer].mode.thresholdValue;
            this.blinking = this.layers[this.activeLayer].mode.blinking;
            this.blinkInterval = this.layers[this.activeLayer].mode.blinkInterval;
            this.modeType = this.layers[this.activeLayer].mode.type;
        }
    }

    checkAuthentication() {
    }

    private exportData() {
        return {
            isDarkTheme: this.isDarkTheme,
            blinking: this.blinking,
            grayscale: this.grayscale,
            threshold: this.threshold,
            blinkInterval: this.blinkInterval,
            rotate: this.rotate,
            perspective: this.perspective,
            anglePerspective: this.anglePerspective,

            top: this.top,
            left: this.left,

            activeLayer: this.activeLayer,
            layers: this.layers,
            modeType: this.modeType,

            width: this.width,
        };
    }

    private importData(data) {

        this.isDarkTheme = data.isDarkTheme;
        this.blinking = data.blinking;
        this.grayscale = data.grayscale;
        this.threshold = data.threshold;
        this.blinkInterval = data.blinkInterval;
        this.rotate = data.rotate;
        this.perspective = data.perspective;
        this.anglePerspective = data.anglePerspective;

        this.top = data.top;
        this.left = data.left;

        this.activeLayer = data.activeLayer;
        this.layers = data.layers;
        this.modeType = data.modeType;

        this.width = data.width;

        this.detector.detectChanges();
    }
}
