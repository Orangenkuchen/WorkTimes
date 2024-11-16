import { Component } from '@angular/core';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDay } from '../../entities/WorkDay';
import { CommonModule } from '@angular/common';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeSlice } from '../../entities/TimeSlice';

interface HoursByTypeHashTable {
    [key: number]: number
}

const viewBoxXMin = 0;
const viewBoxYMin = 0;
const viewBoxXMax = 1000;
const viewBoxYMax = 1000;

const headerHeight = 40;
const timeBarHeight = 60;
const bottomAxisHeight = 30;
const bottomAxisTopMargin = 5;
const leftPadding = 10;
const rightPadding = 10;

const timeBarPadding = 5;

const scalarTickLength = 5;
const scalarTextHeight = bottomAxisHeight - scalarTickLength;

const millisecondsInDay = 24 * 60 * 60 * 1000;

/**
 * Diese Komponente beinhaltet die aktuelle Arbeitszeit
 */
@Component({
    selector: 'app-current-work',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './current-work.component.html',
    styleUrl: './current-work.component.less'
})
export class CurrentWorkComponent
{
    private readonly sanitizer: DomSanitizer;

    private readonly timeRepositoryService: TimeRepositoryService;

    public constructor(
        timeRepositoryService: TimeRepositoryService,
        sanitizer:DomSanitizer)
    {
        this.timeRepositoryService = timeRepositoryService;
        this.sanitizer = sanitizer;

        let currentTime = new Date();
        let startOfDay = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth() + 1,
            currentTime.getDate()
        );
        let endOfDay = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth() + 1,
            currentTime.getDate() + 1,
        );
        endOfDay.setSeconds(-1);

        this.CurrentDayWorkPromise = new Promise<WorkDay>(
            async (success, reject) => {
                let workDays = await timeRepositoryService.GetWorkDays(startOfDay, endOfDay);

                if (workDays.length > 0) {
                    success(workDays[0]);
                }
                else {
                    //success({ Date: currentTime, TimeSlots: [] });
                    success(
                        { 
                            Date: currentTime, 
                            TimeSlots: 
                            [ 
                                {
                                    Start: new Date(2024, 15, 10, 6, 0),
                                    End: new Date(2024, 15, 10, 6, 28),
                                    Type: TimeSliceType.Transfer
                                },
                                {
                                    Start: new Date(2024, 15, 10, 6, 28),
                                    End: new Date(2024, 15, 10, 17, 30),
                                    Type: TimeSliceType.Work
                                },
                                {
                                    Start: new Date(2024, 15, 10, 17, 30),
                                    End: new Date(2024, 15, 10, 17, 56),
                                    Type: TimeSliceType.Transfer
                                }
                            ]
                        }
                    );
                }
            }
        );

        this.CurrentDayWorkPromise.then((x) => {
            this.ChartOptions = this.sanitizer.bypassSecurityTrustHtml(this.CreateSvg([x, x, x]).outerHTML);
        });

        
    }

    public CurrentDayWorkPromise: Promise<WorkDay>;

    public ChartOptions: any;

    private CreateSvg(workDays: Array<WorkDay>): SVGSVGElement
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

            let headerText = this.CreateHeaderTextElement(
                viewBoxSliceYMin,
                currentWorkDay.Date,
                this.SummericeHoursInTimeSlicesByType(currentWorkDay.TimeSlots)
            );
            svgElement.appendChild(headerText);

            let minMintuesOfDay = 5 * 60 + 30;
            let maxMinutesOfDay = 18 * 60 + 30;

            let scalePath = this.CreateScalarPathElement(
                viewBoxXMin + leftPadding,
                viewBoxSliceYMin + headerHeight + timeBarHeight,
                viewBoxYMax - (leftPadding + rightPadding),
                minMintuesOfDay,
                maxMinutesOfDay
            );
            svgElement.appendChild(scalePath);

            let scalarTextElements = this.CreateBottomLegend(
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
                let sliceRect = this.CreateTimeSlice(
                    timeSliceTypeColorHashTable,
                    timeSlice,
                    viewBoxSliceYMin + headerHeight,
                    minMintuesOfDay,
                    maxMinutesOfDay
                );
                svgElement.appendChild(sliceRect);
            }

        }              

        return svgElement;
    }

    private CreateHeaderTextElement(yStart: number, date: Date, hoursByType: HoursByTypeHashTable): SVGTextElement
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

        haederText.innerHTML = `${dateString} - ${this.HourNumberToHourMinuteString(workHours + transferHours)}`;

        if (transferHours > 0)
        {
            haederText.innerHTML += ` (davon ${this.HourNumberToHourMinuteString(transferHours)} Fahrzeit)`
        }

        return haederText;
    }

    private HourNumberToHourMinuteString(number: number): string
    {
        let fullHours = Math.floor(number);
        let minutes = Math.floor(number % 1 * 60);

        return `${fullHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    private SummericeHoursInTimeSlicesByType(timeSlices: Array<TimeSlice>): HoursByTypeHashTable
    {
        let result: HoursByTypeHashTable = {};

        for (let timeSlice of timeSlices)
        {
            if (typeof result[timeSlice.Type] !== "number")
            {
                result[timeSlice.Type] = 0;
            }

            result[timeSlice.Type] += (timeSlice.End!.getTime() - timeSlice.Start!.getTime()) / 1000 / 60 / 60;
        }

        return result;
    }

    private CreateScalarPathElement(
        xStart: number,
        yStart: number,
        xWidth: number,
        minMinutesOfDay: number,
        maxMinutesOfDay: number): SVGPathElement
    {
        let scalePath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        scalePath.setAttribute("fill", "transparent");
        scalePath.setAttribute("stroke", "#B0B0B0");

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

    private CreateBottomLegend(
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

    private CreateTimeSlice(
        timeSliceTypeColorHashTable: { [key: number]: string; }, 
        timeSlice: TimeSlice, 
        yStart: number,
        minMinutesOfDay: number,
        maxMinutesOfDay: number): SVGRectElement
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
        let xStart = (this.TimeOfDayAsMilliseconds(timeSlice.Start!) - startMillisecondsOfDay) * xPerMillisecond;

        sliceRect.setAttribute("x", (xStart + leftPadding).toString());
        sliceRect.setAttribute("y", yStart.toString());
        sliceRect.setAttribute("width", ((this.TimeOfDayAsMilliseconds(timeSlice.End!) - this.TimeOfDayAsMilliseconds(timeSlice.Start!)) * xPerMillisecond).toString());
        sliceRect.setAttribute("height", (timeBarHeight - timeBarPadding).toString());

        return sliceRect;
    }

    private TimeOfDayAsMilliseconds(date: Date): number
    {
        return date.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }
}
