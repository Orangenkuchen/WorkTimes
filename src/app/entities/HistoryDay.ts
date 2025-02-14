/**
 * Stellt die Zusammenfassung von einem Arbeitstag dar.
 */
export interface WorkDayOverview
{
    /**
     * Das Datum vom Arbeitstag
     */
    Date: Date;

    /**
     * Der Startzeitpunkt vom Arbeitsweg zum Arbeitsort hin
     */
    StartToWork: Date | null;

    /**
     * Der Endzeitpunkt vom Arbeitsweg zum Arbeitsort hin
     */
    EndToWork: Date | null;

    /**
     * Der Startzeitpunkt von der Arbeitszeit
     */
    StartWork: Date | null;

    /**
     * Der Endzeitpunkt von der Arbeitszeit
     */
    EndWork: Date | null;

    /**
     * Der Startzeitpunkt vom Arbeitsweg vom Arbeitsort zurück
     */
    StartToHome: Date | null;

    /**
     * Der Endzeitpunkt vom Arbeitsweg vom Arbeitsort zurück
     */
    EndToHome: Date | null;

    /**
     * Die Arbeitszeit am Tag in Millisekunden
     */
    WorkTimeMs: number;

    /**
     * Die Fahrtzeit am Tag in Millisekunden
     */
    DriveTimeMs: number;
}