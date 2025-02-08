import { Component } from '@angular/core';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDay } from '../../entities/WorkDay';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StateDiagramm } from '../../StateDiagramm/StateDiagramm';
import { TimeSlice } from '../../entities/TimeSlice';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { LiveTimeSpanDirective } from '../../directives/LiveTimeSpan/live-time-span.directive';
import { ActiveWorkDay } from '../../entities/ActiveWorkDay';

interface DayDisplay
{
    TransferTimeBeforeWork: TimeSlice,

    WorkTime: TimeSlice,

    TransferTimeAfterWork: TimeSlice,

    WorkDay: ActiveWorkDay
}

/**
 * Stellt die Status dar, die an einem Arbeitstag vorkommen können
 */
enum TimeStatus {
    /**
     * Der initiale Status vor der Arbeit
     */
    Initial,

    /**
     * Die Fahrt zum Einsatzort hin
     */
    DrivingToWork,

    /**
     * Der Einsatz vor Ort
     */
    AtWork,

    /**
     * Die Fahrt nach Hause
     */
    DrivingHome,

    /**
     * Der Status nach der Arbeit
     */
    AfterWork
}

/**
 * Diese Komponente beinhaltet die aktuelle Arbeitszeit
 */
@Component({
    selector: 'app-current-work',
    standalone: true,
    imports: [
        CommonModule,
        LiveTimeSpanDirective
    ],
    templateUrl: './current-work.component.html',
    styleUrl: './current-work.component.less'
})
export class CurrentWorkComponent
{
    // #region fields
    /**
     * Servcie zum bereitigen von HTML, Url, ...
     */
    private readonly sanitizer: DomSanitizer;

    /**
     * Repository für Arbeitszeiten
     */
    private readonly timeRepositoryService: TimeRepositoryService;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Komponente
     * 
     * @param timeRepositoryService Servcie zum bereitigen von HTML, Url, ...
     * @param sanitizer Repository für Arbeitszeiten
     */
    public constructor(
        timeRepositoryService: TimeRepositoryService,
        sanitizer:DomSanitizer)
    {
        this.timeRepositoryService = timeRepositoryService;
        this.sanitizer = sanitizer;

        this.CurrentStatus = TimeStatus.Initial;

        this.DayStatusChart = null;

        this.CurrentDayWorkPromise = this.GetCurrentDayWork();
        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region TimeStatus
    /**
     * Stellt die Status dar, die an einem Arbeitstag vorkommen können
     */
    public TimeStatus = TimeStatus;
    // #endregion

    // #region CurrentDayWorkPromise
    /**
     * Die Zeiten vom aktuellen Tag
     */
    public CurrentDayWorkPromise: Promise<DayDisplay>;
    // #endregion

    // #region DayStatusChart
    /**
     * Das HTML von Diagramm, das den Status von den Tagen anzeigt.
     */
    public DayStatusChart: SafeHtml | null;
    // #endregion

    // #region TimeStatus
    /**
     * Der aktulle Status von der Zeitzählung
     */
    public CurrentStatus: TimeStatus;
    // #endregion

    // #region StartTransfer
    /**
     * Startet die Zeitzählung einer Fahrt zum Einsatzort hin/zurück
     */
    public async StartTransfer(): Promise<void>
    {
        let currentDayWork = await this.CurrentDayWorkPromise;

        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();
        currentDayWork.WorkDay.StartNewTimeSliceIfNonRunning(TimeSliceType.Transfer);

        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region EndTransfer
    /**
     * Stoppt die Zeitzählung einer Fahr zum Einsatzort hin/zurück
     */
    public async EndTransfer(): Promise<void>
    {
        let currentDayWork = await this.CurrentDayWorkPromise;

        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region StartWork
    /**
     * Startet die Zeitzählung am Einsatzort
     */
    public async StartWork(): Promise<void>
    {
        let currentDayWork = await this.CurrentDayWorkPromise;

        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();
        currentDayWork.WorkDay.StartNewTimeSliceIfNonRunning(TimeSliceType.Work);

        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region EndTransfer
    /**
     * Endet die Zeitzählung am Einsatzort
     */
    public async EndWork(): Promise<void>
    {
        let currentDayWork = await this.CurrentDayWorkPromise;

        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region RefreshCurrentDayAndTimeStatus
    /**
     * Ermittelt den aktuellen Arbeitstag aus der Datenbank erneut
     * und füllt ahnhand dessen die Variable {@see CurrentStatus}
     */
    private async RefreshCurrentDayAndTimeStatus(): Promise<void>
    {
        this.CurrentDayWorkPromise = this.GetCurrentDayWork();
        let currentDay = await this.CurrentDayWorkPromise;

        if (currentDay.TransferTimeBeforeWork.Start == null)
        {
            this.CurrentStatus = TimeStatus.Initial;
        }
        else if (currentDay.WorkTime.Start == null)
        {
            this.CurrentStatus = TimeStatus.DrivingToWork
        }
        else if (currentDay.TransferTimeAfterWork.Start == null)
        {
            this.CurrentStatus = TimeStatus.AtWork;
        }
        else if (currentDay.TransferTimeAfterWork.End == null)
        {
            this.CurrentStatus = TimeStatus.DrivingHome;
        }
        else
        {
            this.CurrentStatus = TimeStatus.AfterWork;
        }
    }
    // #endregion

    // #region LoadAndSetStateGrafic
    /**
     * Lädt die Arbeitszeiten von diesem Monat, erstellt daraus ein SVG-Diagramm
     * und weist das HTML vom SVG der Variable DayStatusChart zu.
     */
    private async LoadAndSetStateGrafic(): Promise<void>
    {
        let currentTime = new Date();
        let lastMonth = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth() - 1,
            currentTime.getDate()
        );
        let endOfDay = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate() + 1,
        );
        endOfDay.setSeconds(-1);

        let workDays = await new Promise<Array<WorkDay>>(
            async (success, reject) => {
                let workDays = await this.timeRepositoryService.GetWorkDays(lastMonth, endOfDay);

                success(workDays);
            }
        );

        this.DayStatusChart = this.sanitizer.bypassSecurityTrustHtml(StateDiagramm.Create(workDays).outerHTML);
    }
    // #endregion

    // #region GetCurrentDayWork
    /**
     * Ermittelt den aktuellen Arbeitstag aus der IndexDB oder erstellt einen neuen leeren Tag wenn keiner Vorhanden ist.
     * 
     * @returns Gibt Tag zurück
     */
    private async GetCurrentDayWork(): Promise<DayDisplay>
    {
        let currentTime = new Date();
        let startOfDay = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate()
        );
        let endOfDay = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate() + 1,
        );
        endOfDay.setSeconds(-1);

        let workDays = await this.timeRepositoryService.GetWorkDays(startOfDay, endOfDay);

        let emptyDayStatus: DayDisplay = {
            TransferTimeBeforeWork: {
                Start: null,
                End: null,
                Type: TimeSliceType.Transfer
            },
            WorkTime: {
                Start: null,
                End: null,
                Type: TimeSliceType.Work
            },
            TransferTimeAfterWork: {
                Start: null,
                End: null,
                Type: TimeSliceType.Transfer
            },
            WorkDay: new ActiveWorkDay(new Date())
        };

        if (workDays.length > 0)
        {
            let transfers = workDays[0].TimeSlots.filter(
                (x) => 
                {
                    return x.Type == TimeSliceType.Transfer;
                }
            );
            let workTimes = workDays[0].TimeSlots.filter(
                (x) =>
                {
                    return x.Type == TimeSliceType.Work;
                }
            );

            if (transfers.length >= 1)
            {
                emptyDayStatus.TransferTimeBeforeWork.Start = transfers[0].Start;
                emptyDayStatus.TransferTimeBeforeWork.End = transfers[0].End;
            }

            if (transfers.length >= 2)
            {
                emptyDayStatus.TransferTimeAfterWork.Start = transfers[1].Start;
                emptyDayStatus.TransferTimeAfterWork.End = transfers[1].End;
            }

            if (workTimes.length >= 1)
            {
                emptyDayStatus.WorkTime.Start = workTimes[0].Start;
                emptyDayStatus.WorkTime.End = workTimes[0].End;
            }

            emptyDayStatus.WorkDay = new ActiveWorkDay(workDays[0].Date, workDays[0].TimeSlots);
        }

        return emptyDayStatus;
    }
    // #endregion
}
