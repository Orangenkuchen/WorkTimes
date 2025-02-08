import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

/**
 * Die Anzahl der Millisekunden in einer Sekunden
 */
const MillisecondsInSecond: number = 1000;
/**
 * Die Anzahl der Millisekunden in einer Minute
 */
const MillisecondsInMinute: number = MillisecondsInSecond * 60;
/**
 * Die Anzahl der Millisekunden in einer Stunde
 */
const MillisecondsInHour: number = MillisecondsInMinute * 60

/**
 * Stellt eine Zeit nach Stunden, Minuten, Sekunden, ... dar
 */
interface TimeFragments
{
    Hours: number,
    Minutes: number,
    Seconds: number,
    Milliseconds: number
}

/**
 * Schreibt die Zeit seit "timeDifference" oder dem aktuellen Datum an.
 */
@Directive({
    selector: '[appLiveTimeSpan]',
    standalone: true
})
export class LiveTimeSpanDirective implements OnDestroy, OnChanges
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

    /**
     * Der Startzeitpunkt von dem an die Zeitspanne angezeigt werden soll.
     * Wenn null wird der aktuelle Zeitpunkt angenommen.
     */
    @Input() startTime: Date | null;

    /**
     * Der Endzeitpunkt bis dem die Zeitspanne angezeigt werden soll.
     * Wenn  null wird der aktuelle Zeitpunkt (live) angezeigt.
     */
    @Input() endTime: Date | null;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Directive
     *
     * @param elementRef Referenz auf das Element, an dem die Directive verwendet wird.
     */
    public constructor(elementRef: ElementRef)
    {
        this.elementRef = elementRef;
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.StartTime = null;
        this.EndTime = null;
    }
    // #endregion

    // #region ngOnDestroy
    /**
     * Wird aufgerufen, bevor die Directive abgebaut wird.
     */
    public ngOnDestroy(): void
    {
        if (this.timer != null)
        {
            clearInterval(this.timer);
        }
    }
    // #endregion

    // #region startTime
    /**
     * Der Startzeitpunkt von dem an die Zeitspanne angezeigt werden soll.
     * Wenn null wird der aktuelle Zeitpunkt angenommen.
     */
    @Input() StartTime: Date | null;
    // #endregion

    // #region endTime
    /**
     * Der Endzeitpunkt bis dem die Zeitspanne angezeigt werden soll.
     * Wenn  null wird der aktuelle Zeitpunkt (live) angezeigt.
     */
    @Input() EndTime: Date | null;
    // #endregion

    // #region ngOnChanges
    /**
     * Wird aufgerufen, wenn ein Input sich ändern
     */
    public ngOnChanges()
    {
        this.startTime = this.StartTime;
        this.endTime = this.EndTime;
        
        this.ReinitializeDisplay();
    }
    // #endregion

    // #region static SplitMillisecondsIntoParts
    /**
     * Splittet die angegeben Millisekunden in größere Einheiten
     * 
     * @param milliseconds Die Millisekunden, die gesplittet werden sollen
     * @returns Gibt die größerden Einheiten zurück
     */
    public static SplitMillisecondsIntoParts(milliseconds: number): TimeFragments
    {
        let result: TimeFragments = {
            Hours: 0,
            Minutes: 0,
            Seconds: 0,
            Milliseconds: 0
        };

        let remainingMilliseconds = milliseconds;

        result.Hours = Math.floor(remainingMilliseconds / MillisecondsInHour);
        remainingMilliseconds -= result.Hours * MillisecondsInHour;

        result.Minutes = Math.floor(remainingMilliseconds / MillisecondsInMinute);
        remainingMilliseconds -= result.Minutes * MillisecondsInMinute;

        result.Seconds = Math.floor(remainingMilliseconds / MillisecondsInSecond);
        remainingMilliseconds -= result.Seconds * MillisecondsInSecond;

        result.Milliseconds = remainingMilliseconds;

        return result;
    }
    // #endregion

    // #region ReinitializeDisplay
    /**
     * Initialisiert die Anzeige erneut
     */
    private ReinitializeDisplay()
    {
        if (this.startTime == null)
        {
            this.startTime = new Date();
        }

        if (this.endTime == null)
        {
            this.timer = setInterval(() => { this.HandleOnIntervalElapsed(); }, 200);
        }
        else
        {
            this.HandleOnIntervalElapsed();

            if (this.timer != null)
            {
                clearInterval(this.timer);
            }
        }
    }
    // #endregion

    // #region HandleOnIntervalElapsed
    /**
     * Wird aufgerufen, wenn der Timer zum rendern abgelaufen ist.
     * Rendert die Zeit im Format HH:MM:SS
     */
    private HandleOnIntervalElapsed(): void
    {
        if (this.startTime != null)
        {
            let endTime = this.endTime ?? new Date();

            let timeDifference = endTime.getTime() - this.startTime.getTime();

            let timeFragments = LiveTimeSpanDirective.SplitMillisecondsIntoParts(timeDifference);

            let result = `${timeFragments.Hours}:${timeFragments.Minutes.toString().padStart(2, "0")}:${timeFragments.Seconds.toString().padStart(2, "0")}`;

            (<HTMLElement>this.elementRef.nativeElement).innerText = result;
        }
    }
    // #endregion
}
