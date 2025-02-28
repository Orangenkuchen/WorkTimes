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
    IsNegative: boolean,
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
    exportAs: "liveTimeSpan",
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
        this.timer = null;
        this.StartTime = null;
        this.EndTime = null;

        this.Format = 'h:mm:ss:zzz';
        this.TimeDeltaInMs = 0;
        this.LiveTimeDiffInMs = 0;
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

    // #region StartTime
    /**
     * Der Startzeitpunkt von dem an die Zeitspanne angezeigt werden soll.
     * Wenn null wird der aktuelle Zeitpunkt angenommen.
     */
    @Input() StartTime: Date | null;
    // #endregion

    // #region EndTime
    /**
     * Der Endzeitpunkt bis dem die Zeitspanne angezeigt werden soll.
     * Wenn  null wird der aktuelle Zeitpunkt (live) angezeigt.
     */
    @Input() EndTime: Date | null;
    // #endregion

    // #region Format
    /**
     * Das Format in dem die Differenez angezeigt werden soll.
     * z.B. 'h:mm:ss' -> 15:00:01
     */
    @Input() Format: string;
    // #endregion

    // #region LiveTimeDiffInMs
    /**
     * Die Zeitspanne in Millisekunden.
     */
    public LiveTimeDiffInMs: number;
    // #endregion

    // #region TimeDeltaInMs
    /**
     * Das Zeitdelta, das vor dem Anzeigen auf den Zeitunterschied aufgerechnet werden soll.
     * z.B. 'h:mm:ss' -> 15:00:01
     */
    @Input() TimeDeltaInMs: number;
    // #endregion

    // #region ngOnChanges
    /**
     * Wird aufgerufen, wenn ein Input sich ändern
     */
    public ngOnChanges()
    {        
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
            IsNegative: milliseconds < 0,
            Hours: 0,
            Minutes: 0,
            Seconds: 0,
            Milliseconds: 0
        };

        let remainingMilliseconds = milliseconds;

        result.Hours = this.RoundTowardsZero(remainingMilliseconds / MillisecondsInHour);
        remainingMilliseconds -= result.Hours * MillisecondsInHour;

        result.Minutes = this.RoundTowardsZero(remainingMilliseconds / MillisecondsInMinute);
        remainingMilliseconds -= result.Minutes * MillisecondsInMinute;

        result.Seconds = this.RoundTowardsZero(remainingMilliseconds / MillisecondsInSecond);
        remainingMilliseconds -= result.Seconds * MillisecondsInSecond;

        result.Milliseconds = remainingMilliseconds;

        result.Hours = Math.abs(result.Hours);
        result.Minutes = Math.abs(result.Minutes);
        result.Seconds = Math.abs(result.Seconds);
        result.Milliseconds = Math.abs(result.Milliseconds);

        return result;
    }
    // #endregion

    // #region RoundTowardsZero
    /**
     * Rundet die Zahl runter (foor) wenn positiv oder hoch (ceil) wenn negativ
     * 
     * @param number Die Zahl die gerundet werden soll
     */
    private static RoundTowardsZero(number: number): number
    {
        return number >= 0 ? Math.floor(number) : Math.ceil(number); 
    }
    // #endregion

    // #region ReinitializeDisplay
    /**
     * Initialisiert die Anzeige erneut
     */
    private ReinitializeDisplay()
    {
        if (this.EndTime == null)
        {
            this.timer = setInterval(() => { this.HandleOnIntervalElapsed(); }, 2000);
            this.HandleOnIntervalElapsed();
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
        if (this.StartTime != null)
        {
            let endTime = this.EndTime ?? new Date();

            let timeDifference = (endTime.getTime() - this.StartTime.getTime()) + this.TimeDeltaInMs;
            this.LiveTimeDiffInMs = timeDifference;

            let timeFragments = LiveTimeSpanDirective.SplitMillisecondsIntoParts(timeDifference);

            let result = this.Format.toLowerCase()
                                    .replaceAll("h", timeFragments.Hours.toString())
                                    .replaceAll("mm", timeFragments.Minutes.toString().padStart(2, "0"))
                                    .replaceAll("ss", timeFragments.Seconds.toString().padStart(2, "0"))
                                    .replaceAll("zzz", timeFragments.Milliseconds.toString());

            if (timeDifference < 0)
            {
                result = result.replaceAll("+", "-");
            }

            (<HTMLElement>this.elementRef.nativeElement).innerText = result;
        }
    }
    // #endregion
}
