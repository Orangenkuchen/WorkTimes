import { LiveTimeSpanDirective } from "../directives/LiveTimeSpan/live-time-span.directive";
import { WorkDayOverview } from "../entities/HistoryDay";

/**
 * Hilfsklasse mit Funktionen zu Datum
 */
export class DateHelper
{
    // #region FormatDate
    /**
     * Formatiert das Datum anhand vom String
     * 
     * @param date Das Datum, das formatiert werden soll
     * @param format Das Fromat in dem das Datum formartiert werden soll
     */
    public static FormatDate(date: Date | null, format: string): string
    {
        if (date == null)
        {
            return "";
        }

        let result = format;

        if (result.indexOf("dd") != -1)
        {
            result = result.replaceAll("dd", date.getDate().toString().padStart(2, "0"));
        }

        if (result.indexOf("MM") != -1)
        {
            result = result.replaceAll("MM", (date.getMonth() + 1).toString().padStart(2, "0"));
        }

        if (result.indexOf("yyyy") != -1)
        {
            result = result.replaceAll("yyyy", date.getFullYear().toString().padStart(4, "0"));
        }

        if (result.indexOf("HH") != -1)
        {
            result = result.replaceAll("HH", date.getHours().toString().padStart(2, "0"));
        }

        if (result.indexOf("mm") != -1)
        {
            result = result.replaceAll("mm", date.getMinutes().toString().padStart(2, "0"));
        }

        if (result.indexOf("ss") != -1)
        {
            result = result.replaceAll("ss", date.getSeconds().toString().padStart(2, "0"));
        }

        if (result.indexOf("zzz") != -1)
        {
            result = result.replaceAll("zzz", date.getMilliseconds().toString());
        }

        return result;
    }
    // #endregion
}