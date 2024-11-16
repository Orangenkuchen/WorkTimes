import { TimeSliceType } from "./TimeSliceType";

/**
 * Stellt einen Zeitslot an einem Arbeitstag dar.
 */
export interface TimeSlice
{
    /**
     * Die Startzeit vom Zeitslot
     */
    Start: Date | null;

    /**
     * Die Endzeit vom Zeitslot
     */
    End: Date | null;

    /**
     * Der Typ von diesem Slice
     */
    Type: TimeSliceType;
}