import { TimeSlice } from '../entities/TimeSlice';
import { TimeSliceType } from '../entities/TimeSliceType';
import { WorkDay } from '../entities/WorkDay';

/**
 * Der Startwert vom X-Wert der ViewBox von der SVG
 */
const viewBoxXMin = 0;
/**
 * Der Startwert vom Y-Wert der ViewBox von der SVG
 */
const viewBoxYMin = 0;
/**
 * Der Endwert vom X-Wert der ViewBox von der SVG
 */
const viewBoxXMax = 1000;
/**
 * Der Endwert vom Y-Wert der ViewBox von der SVG
 */
const viewBoxYMax = 1000;

/**
 * Die Höhe vom Header in der Grafik (in ViewBox-Einheit)
 */
const headerHeight = 40;
/**
 * Die Höhe von einem Balken der einen Tag darstellt in der Grafik
 */
const timeBarHeight = 60;
/**
 * Die Höhe vom Zeitstrahl, der unter den Tag-Balken angezeigt wird.
 */
const bottomAxisHeight = 30;
/**
 * Der Abstand vom Zeitstrahl nach oben zum Tag-Balken.
 */
const bottomAxisTopMargin = 5;
/**
 * Der linke Seitenabstand von der Grafik.
 */
const leftPadding = 10;
/**
 * Der rechte Seitenabstand von der Grafik.
 */
const rightPadding = 10;

/**
 * Der Abstand vom Tag-Balken nach untern zum Zeitstrahl
 */
const timeBarPadding = 5;

/**
 * Die Länge von einem vertikalen Stich im Zeitstrahl
 */
const scalarTickLength = 5;

/**
 * Die Höhe vom Text im Zeitstrahl
 */
const scalarTextHeight = bottomAxisHeight - scalarTickLength;

/**
 * Die Anzahl der Millisekunden in einem Tag
 */
const millisecondsInDay = 24 * 60 * 60 * 1000;

/**
 * Hashtable mit den Stunden pro Time-Slice-Typ
 */
interface HoursByTypeHashTable {
    [key: number]: number
}

/**
 * Beinhaltet Funktionen zum Erstellen eines SVG-Diagramms
 */
export class StateDiagramm
{
    // #region Create
    /**
     * Erstellt ein State-Diagramm-SVG
     * 
     * @param workDays Die Arbeitstage, die im Diagramm angezeigt werden soll
     * @returns Gibt die Grafik als SVG zurück
     */
    public static Create(workDays: Array<WorkDay>): SVGSVGElement
    {
        let timeSliceTypeColorHashTable: { [key: number ]: string } = {};
        timeSliceTypeColorHashTable[TimeSliceType.Transfer] = "#00FF00";
        timeSliceTypeColorHashTable[TimeSliceType.Work] = "#FF0000";

        let svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", `${viewBoxXMin} ${viewBoxYMin} ${viewBoxXMax} ${viewBoxYMax}`);

        for (let workDayIndex = 0; workDayIndex < workDays.length; workDayIndex++)
        {
            let currentWorkDay = workDays[workDayIndex];

            let viewBoxSliceYMin = viewBoxYMin + (headerHeight + timeBarHeight + bottomAxisHeight) * workDayIndex;

            let headerText = StateDiagramm.CreateHeaderTextElement(
                viewBoxSliceYMin,
                currentWorkDay.Date,
                StateDiagramm.SummericeHoursInTimeSlicesByType(currentWorkDay.TimeSlots)
            );
            svgElement.appendChild(headerText);

            let minMintuesOfDay = 5 * 60 + 30;
            let maxMinutesOfDay = 18 * 60 + 30;

            let scalePath = StateDiagramm.CreateScalarPathElement(
                viewBoxXMin + leftPadding,
                viewBoxSliceYMin + headerHeight + timeBarHeight,
                viewBoxYMax - (leftPadding + rightPadding),
                minMintuesOfDay,
                maxMinutesOfDay
            );
            svgElement.appendChild(scalePath);

            let scalarTextElements = StateDiagramm.CreateBottomLegend(
                viewBoxXMin + leftPadding,
                viewBoxSliceYMin + headerHeight + timeBarHeight,
                minMintuesOfDay,
                maxMinutesOfDay
            );
            for(let scalarText of scalarTextElements)
            {
                svgElement.appendChild(scalarText);
            }

            for (let timeSlice of currentWorkDay.TimeSlots)
            {
                let sliceRect = StateDiagramm.CreateTimeSlice(
                    timeSliceTypeColorHashTable,
                    timeSlice,
                    viewBoxSliceYMin + headerHeight,
                    minMintuesOfDay,
                    maxMinutesOfDay
                );

                if (sliceRect != null)
                {
                    svgElement.appendChild(sliceRect);
                }
            }

        }              

        return svgElement;
    }
    // #endregion

    // #region CreateHeaderTextElement
    /**
     * Erstellt das SVG-Text-Element für einen Tag-Balken in der Grafik
     * 
     * @param yStart Der Y-Startwert von dem aus der Text nach unten positioniert weren soll
     * @param date Das Datum vom Tag, der im Header dargestellt werden soll
     * @param hoursByType Die Stunden vom Tag summiert pro Slice-Typ
     * 
     * @returns Gibt das SVGTextElement für den Header zurück.
     */
    private static CreateHeaderTextElement(yStart: number, date: Date, hoursByType: HoursByTypeHashTable): SVGTextElement
    {
        let headerMiddle = (viewBoxXMax - (leftPadding + rightPadding)) / 2 + leftPadding;

        let haederText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        haederText.setAttribute("x", headerMiddle.toString());
        haederText.setAttribute("y", (yStart + headerHeight - 5).toString());
        haederText.setAttribute("text-anchor", "middle");

        let dateString = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;

        let workHours = 0;
        let transferHours = 0;

        if (typeof hoursByType[TimeSliceType.Work] === "number")
        {
            workHours = hoursByType[TimeSliceType.Work];
        }
        if (typeof hoursByType[TimeSliceType.Transfer] === "number")
        {
            transferHours = hoursByType[TimeSliceType.Transfer];
        }

        haederText.innerHTML = `${dateString} - ${StateDiagramm.HourNumberToHourMinuteString(workHours + transferHours)}`;

        if (transferHours > 0)
        {
            haederText.innerHTML += ` (davon ${StateDiagramm.HourNumberToHourMinuteString(transferHours)} Fahrzeit)`
        }

        return haederText;
    }
    // #endregion

    // #region HourNumberToHourMinuteString
    /**
     * Erstellt anhand von einer Stundenanzahl (mit Komma) eines String im Format HH:MM
     * 
     * @param number Die Anzahl der Stunden (kann Kommawerte für Minuten beinhalten)
     * @returns Gibt den String zurück
     */
    private static HourNumberToHourMinuteString(number: number): string
    {
        let fullHours = Math.floor(number);
        let minutes = Math.floor(number % 1 * 60);

        return `${fullHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    // #endregion

    // #region SummericeHoursInTimeSlicesByType
    /**
     * Summiert die Stunden in den angegeben TimeSlices pro Typ
     * 
     * @param timeSlices Die Timeslices deren Zeiten zusammengezäht werden sollen
     * @returns Gibt die Zusammengezählten Stunden zurück
     */
    private static SummericeHoursInTimeSlicesByType(timeSlices: Array<TimeSlice>): HoursByTypeHashTable
    {
        let result: HoursByTypeHashTable = {};

        for (let timeSlice of timeSlices)
        {
            if (typeof result[timeSlice.Type] !== "number")
            {
                result[timeSlice.Type] = 0;
            }

            if (timeSlice.Start != null && timeSlice.End != null)
            {
                result[timeSlice.Type] += (timeSlice.End.getTime() - timeSlice.Start.getTime()) / 1000 / 60 / 60;
            }
        }

        return result;
    }
    // #endregion

    // #region CreateScalarPathElement
    /**
     * Erstellt den Pfad für den Zeitstrahl für einen Tag-Balken
     * 
     * @param xStart Die X-Coordinate, bei der der Zeitstrahl starten soll
     * @param yStart Die Y-Coordinate, bei dem der Zeitstrahl starten soll
     * @param xWidth Die Länge vom Zeitstrahl in X-Richtung
     * @param minMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl anfangen soll
     * @param maxMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl enden soll
     * @returns Gibt das SVG-Path-Element zurück
     */
    private static CreateScalarPathElement(
        xStart: number,
        yStart: number,
        xWidth: number,
        minMinutesOfDay: number,
        maxMinutesOfDay: number): SVGPathElement
    {
        let scalePath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        scalePath.setAttribute("fill", "transparent");
        scalePath.setAttribute("class", "LegendLine");

        let minutesInDay = 24 * 60;
        let hourAmount = Math.floor((minutesInDay - minMinutesOfDay - (minutesInDay - maxMinutesOfDay)) / 60);
        let tickDistanceX = (viewBoxYMax - (leftPadding + rightPadding)) / hourAmount;

        let tickStartX = xStart + tickDistanceX * (minMinutesOfDay / 60 % 1);

        let scaleDInstructions = new Array<string>(
            `M ${xStart} ${yStart + bottomAxisTopMargin}`,
            `h ${xWidth}`,
            `M ${tickStartX} ${yStart + bottomAxisTopMargin - scalarTickLength}`
        );

        for (let i = 0; i < hourAmount; i++) {
            scaleDInstructions.push(`v 0 ${scalarTickLength}`);

            if (i + 1 != hourAmount) {
                scaleDInstructions.push(`m ${tickDistanceX} -${scalarTickLength}`);
            }

            else {
                scaleDInstructions.push("Z");
            }
        }

        scalePath.setAttribute("d", scaleDInstructions.join(" "));

        return scalePath;
    }
    // #endregion

    // #region CreateBottomLegend
    /**
     * Erstellt die Uhrzeit-Texte in der Legende, welche unter den Zeit-Balken dargestellt werden.
     * 
     * @param xStart Die X-Startposition von den Legende-Texten
     * @param yStart Die Y-Startposition von den Legende-Texten
     * @param minMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl anfangen soll
     * @param maxMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl enden soll
     * @returns Gibt die Liste von SVGTextELementen 
     */
    private static CreateBottomLegend(
        xStart: number,
        yStart: number,
        minMinutesOfDay: number,
        maxMinutesOfDay: number): Array<SVGTextElement>
    {
        let textElements = new Array<SVGTextElement>();

        let minutesInDay = 24 * 60;
        let hourAmount = Math.floor((minutesInDay - minMinutesOfDay - (minutesInDay - maxMinutesOfDay)) / 60);
        let tickDistanceX = (viewBoxYMax - (leftPadding + rightPadding)) / hourAmount;
        let tickStartX = xStart + tickDistanceX * (minMinutesOfDay / 60 % 1);

        for (let i = 0; i < hourAmount; i++)
        {
            let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("x", (tickStartX + i * tickDistanceX).toString());
            textElement.setAttribute("y", (yStart + scalarTextHeight).toString());
            textElement.setAttribute("text-anchor", "middle");
            textElement.innerHTML = `${(Math.ceil(minMinutesOfDay / 60) + i).toString().padStart(2, "0")}:00`

            textElements.push(textElement);
        }

        return textElements;
    }
    // #endregion

    // #region CreateTimeSlice
    /**
     * Erstellt die Rechteck für den angegeben TimeSlice
     * 
     * @param timeSliceTypeColorHashTable Hashtable mit den Farben pro Slice-Type
     * @param timeSlice Der Timeslice für den das Rechteck erstellt werden soll
     * @param yStart Die Y-Startposition vom Rechteck
     * @param minMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl anfangen soll
     * @param maxMinutesOfDay Die Zeitpunkt vom Tag in Mintuen, an dem der Zeitstrahl enden soll
     * @returns Gibt das SVG-Rect-Element für den TimeSlice zurück.
     */
    private static CreateTimeSlice(
        timeSliceTypeColorHashTable: { [key: number]: string; }, 
        timeSlice: TimeSlice, 
        yStart: number,
        minMinutesOfDay: number,
        maxMinutesOfDay: number): SVGRectElement | null
    {
        if (timeSlice.Start != null && timeSlice.End != null)
        {
            let sliceRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            if (typeof timeSliceTypeColorHashTable[timeSlice.Type] === 'string') 
            {
                sliceRect.setAttribute("fill", timeSliceTypeColorHashTable[timeSlice.Type]);
            }
            else 
            {
                sliceRect.setAttribute("fill", "#B0B0B0");
            }

            let millisecondsInDisplayedSliceOfDay = millisecondsInDay - (minMinutesOfDay * 60 * 1000) - (millisecondsInDay - (maxMinutesOfDay * 60 * 1000));

            let xPerMillisecond = (viewBoxYMax - (leftPadding + rightPadding)) / millisecondsInDisplayedSliceOfDay;

            let startMillisecondsOfDay = minMinutesOfDay * 60 * 1000;
            let xStart = (StateDiagramm.TimeOfDayAsMilliseconds(timeSlice.Start) - startMillisecondsOfDay) * xPerMillisecond;

            sliceRect.setAttribute("x", (xStart + leftPadding).toString());
            sliceRect.setAttribute("y", yStart.toString());
            sliceRect.setAttribute("width", ((StateDiagramm.TimeOfDayAsMilliseconds(timeSlice.End) - StateDiagramm.TimeOfDayAsMilliseconds(timeSlice.Start)) * xPerMillisecond).toString());
            sliceRect.setAttribute("height", (timeBarHeight - timeBarPadding).toString());

            return sliceRect;
        }
        else
        {
            return null;
        }
    }
    // #endregion

    // #region TimeOfDayAsMilliseconds
    /**
     * Ermittelt die Anzahl der Millisekunden vom aktuellen Tag
     * 
     * @param date Das Datum, von dem die Millesekunden ermittelt werden sollen
     * @returns Gibt die Anzahl zurück
     */
    private static TimeOfDayAsMilliseconds(date: Date): number
    {
        return date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }
    // #endregion
}