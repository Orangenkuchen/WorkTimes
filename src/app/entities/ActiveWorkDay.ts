import { TimeSlice } from "./TimeSlice";
import { TimeSliceType } from "./TimeSliceType";
import { WorkDay } from "./WorkDay";

/**
 * Stellt einen aktiven Arbeitstag dar.
 */
export class ActiveWorkDay implements WorkDay
{
    // #region ctor
    /**
     * Initialisier die Klasse
     * 
     * @param date Das Datum vom Arbeitstag
     * @param timeslots Die TimeSlices vom Tag
     */
    public constructor(date: Date, timeslots?: Array<TimeSlice>)
    {
        this.Date = date;

        if (typeof timeslots === "undefined")
        {
            this.TimeSlots = new Array<TimeSlice>;
        }
        else
        {
            this.TimeSlots = timeslots;
            this.SortTimeSlots();
        }
    }
    // #endregion

    // #region Date
    /**
     * @inheritdoc
     */
    public Date: Date;
    // #endregion

    // #region TimeSlots
    /**
     * @inheritdoc
     */
    public TimeSlots: Array<TimeSlice>;
    // #endregion

    // #region CurrentSlice
    /**
     * Der aktuelle Timeslice oder null, wenn für den Tag keine Timeslices vorhanden sind.
     */
    public get CurrentSlice(): TimeSlice | null
    {
        if (this.TimeSlots.length == 0)
        {
            return null;
        }
        else
        {
            return this.TimeSlots[this.TimeSlots.length - 1];
        }
    }
    // #endregion

    // #regiond EndCurrentTimeSliceIfNotEnded
    /**
     * Beendet den aktuellen Timeslice, wenn dieser Vorhanden ist und noch nicht beendet wurde
     */
    public EndCurrentTimeSliceIfNotEnded(): void
    {
        let currentSlice = this.CurrentSlice;

        if (currentSlice != null && currentSlice.End == null)
        {
            currentSlice.End = new Date();
        }
    }
    // #endregion

    // #region StartNewTimeSliceIfNonRunning
    /**
     * Startet einen neuen TimeSlice wenn aktuell noch keiner läuft.
     * 
     * @param type Der Typ vom neuen Timeslice
     */
    public StartNewTimeSliceIfNonRunning(type: TimeSliceType): void
    {
        let currentSlice = this.CurrentSlice;

        if (currentSlice == null || currentSlice.End != null)
        {
            this.TimeSlots.push(
                {
                    Start: new Date(),
                    End: null,
                    Type: type
                }
            );
        }
    }
    // #endregion
    
    // #region SortTimeSlots
    /**
     * Sortiert die TimeSlots
     */
    private SortTimeSlots(): void
    {
        this.TimeSlots = this.TimeSlots.sort(
            (a, b) => 
            {
                let aDate = a.Start ?? a.End;
                let bDate = b.Start ?? b.End;

                if (aDate != null && bDate != null)
                {
                    return aDate.getTime() - bDate.getTime();
                }
                else
                {
                    return 0
                }
            }
        );
    }
    // #endregion
}