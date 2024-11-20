import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

const MillisecondsInSecond: number = 1000;
const MillisecondsInMinute: number = MillisecondsInSecond * 60;
const MillisecondsInHour: number = MillisecondsInMinute * 60

interface TimeFragments
{
    Hours: number,
    Minutes: number,
    Seconds: number,
    Milliseconds: number
}

@Directive({
    selector: '[appLiveTimeSpan]',
    standalone: true
})
export class LiveTimeSpanDirective implements OnDestroy, AfterViewInit
{
    // #region fields
    /**
     * Verweis auf das Element, an dem die Directive angehängt wurde.
     */
    private elementRef: ElementRef;

    /**
     * Der Timer der die Zeit anzeigt
     */
    private timer: ReturnType<typeof setInterval> | null;
    // #endregion


    public constructor(elementRef: ElementRef)
    {
        this.elementRef = elementRef;
        this.timeDifference = null;
        this.timer = null;
    }

    public ngOnDestroy(): void
    {
        if (this.timer != null)
        {
            clearInterval(this.timer);
        }
    }

    public ngAfterViewInit(): void
    {
        if (this.timeDifference == null)
        {
            this.timeDifference = new Date();
        }

        this.timer = setInterval(() => { this.HandleOnIntervalElapsed(); }, 200);
    }

    @Input() timeDifference: Date | null;

    private HandleOnIntervalElapsed(): void
    {
        if (this.timeDifference != null)
        {
            let timeDifference = new Date().getTime() - this.timeDifference.getTime();

            let timeFragments = this.SplitMillisecondsIntoParts(timeDifference);

            let result = `${timeFragments.Hours}:${timeFragments.Minutes.toString().padStart(2, "0")}:${timeFragments.Seconds.toString().padStart(2, "0")}`;

            (<HTMLElement>this.elementRef.nativeElement).innerText = result;
        }
    }

    // #region SplitMillisecondsIntoParts
    /**
     * Splittet die angegeben Millisekunden in größere Einheiten
     * 
     * @param milliseconds Die Millisekunden, die gesplittet werden sollen
     * @returns Gibt die größerden Einheiten zurück
     */
    private SplitMillisecondsIntoParts(milliseconds: number): TimeFragments
    {
        let result: TimeFragments = {
            Hours: 0,
            Minutes: 0,
            Seconds: 0,
            Milliseconds: 0
        };

        let remainingMilliseconds = milliseconds;

        result.Hours = Math.floor(remainingMilliseconds / MillisecondsInHour);
        remainingMilliseconds = remainingMilliseconds - result.Hours * MillisecondsInHour;

        result.Minutes = Math.floor(remainingMilliseconds / MillisecondsInMinute);
        remainingMilliseconds = remainingMilliseconds - result.Minutes * MillisecondsInMinute;

        result.Seconds = Math.floor(remainingMilliseconds / MillisecondsInSecond);
        remainingMilliseconds = remainingMilliseconds - result.Seconds * MillisecondsInSecond;

        result.Milliseconds = remainingMilliseconds;

        result.Minutes = Math.floor((milliseconds ))

        return result;
    }
    // #endregion
}
