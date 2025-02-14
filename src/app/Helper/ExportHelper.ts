import { LiveTimeSpanDirective } from "../directives/LiveTimeSpan/live-time-span.directive";
import { WorkDayOverview } from "../entities/HistoryDay";
import { DateHelper } from "./DateHelper";

/**
 * Hilfsklasse mit Funktionen zum Exportieren
 */
export class ExportHelper
{
    // #region WorkDayToCsv
    /**
     * Wandelt die Arbeitstage in eine CSV-Datei um
     * 
     * @param workDays Die Arbeitstage die in die CSV-Datei eingefügt werden sollen
     * @param separater Der Zellenseparator in der CSV-Datei
     * @returns Gibt den Blob von der CSV-Datei zurück
     */
    public static WorkDayToCsv(workDays: Array<WorkDayOverview>, separater: string = ','): Blob
    {
        let stringBuilder = new Array<string>(
            "Datum",
            separater,
            "Fahrtweg hin",
            separater,
            "Arbeitszeit",
            separater,
            "Fahrtweg zurück",
            separater,
            "Arbeitsstunden",
            separater,
            "Fahrtzeitstunden",
            "\n"
        );

        for (let workDay of workDays)
        {
            stringBuilder.push(DateHelper.FormatDate(workDay.Date, "dd.MM.yyyy"));
            stringBuilder.push(separater);

            stringBuilder.push(DateHelper.FormatDate(workDay.StartToHome, "HH:mm"));
            stringBuilder.push(" - ");
            stringBuilder.push(DateHelper.FormatDate(workDay.EndToWork, "HH:mm"));
            stringBuilder.push(separater);

            stringBuilder.push(DateHelper.FormatDate(workDay.StartWork, "HH:mm"));
            stringBuilder.push(" - ");
            stringBuilder.push(DateHelper.FormatDate(workDay.EndWork, "HH:mm"));
            stringBuilder.push(separater);

            stringBuilder.push(DateHelper.FormatDate(workDay.StartToHome, "HH:mm"));
            stringBuilder.push(" - ");
            stringBuilder.push(DateHelper.FormatDate(workDay.EndToHome, "HH:mm"));
            stringBuilder.push(separater);

            let workTimeSplit = LiveTimeSpanDirective.SplitMillisecondsIntoParts(workDay.WorkTimeMs);
            stringBuilder.push(`${workTimeSplit.Hours.toString().padStart(2, "0")}:${workTimeSplit.Minutes.toString().padEnd(2, "0")}`);
            stringBuilder.push(separater);

            let transferTimeSplit = LiveTimeSpanDirective.SplitMillisecondsIntoParts(workDay.DriveTimeMs);
            stringBuilder.push(`${transferTimeSplit.Hours.toString().padStart(2, "0")}:${transferTimeSplit.Minutes.toString().padEnd(2, "0")}`);

            stringBuilder.push("\n");
        }

        return new Blob([stringBuilder.join("")], { type: 'text/csv' });
    }
    // #endregion
}