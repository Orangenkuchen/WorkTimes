/**
 * Stellt den Typ vom Zeitslot dar
 */
export enum TimeSliceType
{
    /**
     * Der Zeitslot stellt Fahrzeit dar
     */
    Transfer = 1,

    /**
     * Der Zeitslot stellt Arbeitszeit dar
     */
    Work = 2,

    /**
     * Der Zeitslot stellt Pausenzeit dar
     */
    Pause = 3
}