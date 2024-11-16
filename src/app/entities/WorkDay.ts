import { TimeSlice } from "./TimeSlice";

/**
 * Stellt einen Arbeitstag dar
 */
export interface WorkDay
{
    /**
     * Das Datum vom Arbeitstag
     */
    Date: Date;

    /**
     * Die Zeiten vom Tag
     */
    TimeSlots: Array<TimeSlice>;
}