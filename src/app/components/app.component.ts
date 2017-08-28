/**
 * Import decorators and services from angular
 */
import {Component, HostListener, OnInit, ViewEncapsulation} from "@angular/core";
import {LayerMode, LayerModeType, PictureLayer} from "../models/Picture";

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
        <div class="mat-body mat-typography" [class.empty]="empty" [class.m2app-dark]="isDarkTheme" (dragover)="onDragOver($event)"
             (drop)="onDrop($event)">
            <main>
                <router-outlet></router-outlet>
                <md-toolbar>
                    <span><md-slide-toggle (change)="isDarkTheme = !isDarkTheme" [checked]="isDarkTheme"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slider min="0" max="100" step="0.5" [(value)]="threshold"></md-slider></span>
                    <span><md-slide-toggle (change)="grayscale = !grayscale" [checked]="grayscale"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slide-toggle (change)="blinking = !blinking" [checked]="blinking"
                                           color="primary"></md-slide-toggle></span>
                    <span><md-slider min="0" max="100" step="0.5" [(value)]="blinkInterval"></md-slider></span>
                </md-toolbar>
                <div class="picture">

                </div>
            </main>
        </div>
    `
})
export class AppComponent implements OnInit {
    isFullscreen: boolean = false;

    //component initialization
    isDarkTheme: boolean = false;
    blinking: boolean = false;
    grayscale: boolean = false;
    empty: boolean = false;

    threshold: number = 50;
    blinkInterval: number = 50;

    ngOnInit() {
        const remote = require('electron').remote;
        console.debug(remote.process.argv);
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDrop(event: DragEvent) {
        if (event.dataTransfer.files && event.dataTransfer.files.length) {
            for (let file of Array.from(event.dataTransfer.files)) {
                if (["image/png", "image/jpeg"].indexOf(file.type) >= 0) {
                    const newLayer: PictureLayer = {
                        path: file['path'], // Electron adds this automatically
                        mode: {
                            type: LayerModeType.NORMAL,
                            thresholdValue: this.threshold,
                            grayscale: this.grayscale,
                            blinking: this.blinking,
                            blinkInterval: this.blinkInterval,
                        } as LayerMode
                    };
                    console.log(newLayer);
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

        if (event.code === "KeyG") {
            this.grayscale = !this.grayscale;
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

        if (event.code === "Space") {
            this.empty = !this.empty;
        }
    }

    checkAuthentication() {
    }
}
