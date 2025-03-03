import { Component, EventEmitter, Output } from '@angular/core';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDay } from '../../entities/WorkDay';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StateDiagramm } from '../../StateDiagramm/StateDiagramm';
import { TimeSlice } from '../../entities/TimeSlice';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { LiveTimeSpanDirective } from '../../directives/LiveTimeSpan/live-time-span.directive';
import { ActiveWorkDay } from '../../entities/ActiveWorkDay';
import { Logger } from 'serilogger';
import { LoggerService } from '../../services/Logger/logger.service';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

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
        LiveTimeSpanDirective,
        MatButtonModule,
        MatRippleModule
    ],
    templateUrl: './current-work.component.html',
    styleUrl: './current-work.component.less'
})
export class CurrentWorkComponent
{
    // #region fields
    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

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
     * @param loggerService Service für Lognachrichten
     * @param timeRepositoryService Servcie zum bereitigen von HTML, Url, ...
     * @param sanitizer Repository für Arbeitszeiten
     */
    public constructor(
        loggerService: LoggerService,
        timeRepositoryService: TimeRepositoryService,
        sanitizer:DomSanitizer)
    {
        this.logger = loggerService.Logger;
        this.timeRepositoryService = timeRepositoryService;
        this.sanitizer = sanitizer;

        this.CurrentStatus = TimeStatus.Initial;
        this.StatusChange = new EventEmitter<void>();

        this.DayStatusChart = null;

        this.CurrentDayWorkPromise = this.GetCurrentDayWork();
        this.RefreshCurrentDayAndTimeStatus();
        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region Outputs
    /**
     * Wird ausgelöst, wenn sich der aktuelle Status verändert durch den Benutzer.
     */
    @Output()
    public readonly StatusChange: EventEmitter<void>;
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

    // #region CurrentStatus
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
        this.logger.info("CurrentWorkComponent > StartTransfer: Wurde aufgerufen");

        let currentDayWork = await this.CurrentDayWorkPromise;

        this.logger.debug("CurrentWorkComponent > StartTransfer: Beende den aktuellen TimeSlice...");
        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        this.logger.debug(
            "CurrentWorkComponent > StartTransfer: Starte einen neuen TimeSlice ({0})...",
            TimeSliceType[TimeSliceType.Transfer]
        );
        currentDayWork.WorkDay.StartNewTimeSliceIfNonRunning(TimeSliceType.Transfer);

        this.logger.debug("CurrentWorkComponent > StartTransfer: Speichere den aktuell Tag in der Index-DB...");
        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.logger.debug("CurrentWorkComponent > StartTransfer: Aktualisiere die angezeigten TimeSlices...");
        this.RefreshCurrentDayAndTimeStatus();

        this.StatusChange.emit();

        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region EndTransfer
    /**
     * Stoppt die Zeitzählung einer Fahr zum Einsatzort hin/zurück
     */
    public async EndTransfer(): Promise<void>
    {
        this.logger.info("CurrentWorkComponent > EndTransfer: Wurde aufgerufen");

        let currentDayWork = await this.CurrentDayWorkPromise;

        this.logger.debug("CurrentWorkComponent > EndTransfer: Beende den aktuellen TimeSlice...");
        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        this.logger.debug("CurrentWorkComponent > EndTransfer: Speichere den aktuell Tag in der Index-DB...");
        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.logger.debug("CurrentWorkComponent > EndTransfer: Aktualisiere die angezeigten TimeSlices...");
        this.RefreshCurrentDayAndTimeStatus();

        this.StatusChange.emit();

        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region StartWork
    /**
     * Startet die Zeitzählung am Einsatzort
     */
    public async StartWork(): Promise<void>
    {
        this.logger.info("CurrentWorkComponent > StartWork: Wurde aufgerufen");

        let currentDayWork = await this.CurrentDayWorkPromise;

        this.logger.debug("CurrentWorkComponent > StartWork: Beende den aktuellen TimeSlice...");
        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        this.logger.debug(
            "CurrentWorkComponent > StartWork: Starte einen neuen TimeSlice ({0})...",
            TimeSliceType[TimeSliceType.Work]
        );
        currentDayWork.WorkDay.StartNewTimeSliceIfNonRunning(TimeSliceType.Work);

        this.logger.debug("CurrentWorkComponent > StartWork: Speichere den aktuell Tag in der Index-DB...");
        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.logger.debug("CurrentWorkComponent > StartWork: Aktualisiere die angezeigten TimeSlices...");
        this.RefreshCurrentDayAndTimeStatus();

        this.StatusChange.emit();

        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region EndTransfer
    /**
     * Endet die Zeitzählung am Einsatzort
     */
    public async EndWork(): Promise<void>
    {
        this.logger.info("CurrentWorkComponent > EndWork: Wurde aufgerufen");

        let currentDayWork = await this.CurrentDayWorkPromise;

        this.logger.verbose("CurrentWorkComponent > EndWork: Beende den aktuellen TimeSlice...");
        currentDayWork.WorkDay.EndCurrentTimeSliceIfNotEnded();

        this.logger.verbose("CurrentWorkComponent > EndWork: Speichere den aktuell Tag in der Index-DB...");
        await this.timeRepositoryService.PutWorkDay(
            {
                Date: currentDayWork.WorkDay.Date,
                TimeSlots: currentDayWork.WorkDay.TimeSlots
            }
        );

        this.logger.verbose("CurrentWorkComponent > EndWork: Aktualisiere die angezeigten TimeSlices...");
        this.RefreshCurrentDayAndTimeStatus();

        this.StatusChange.emit();

        //this.LoadAndSetStateGrafic();
    }
    // #endregion

    // #region RefreshCurrentDayAndTimeStatus
    /**
     * Ermittelt den aktuellen Arbeitstag aus der Datenbank erneut
     * und füllt ahnhand dessen die Variable {@link CurrentStatus}
     */
    public async RefreshCurrentDayAndTimeStatus(): Promise<void>
    {
        this.logger.info("CurrentWorkComponent > RefreshCurrentDayAndTimeStatus: Wurde aufgerufen");

        this.logger.debug(
            "CurrentWorkComponent > RefreshCurrentDayAndTimeStatus: Ermittle den aktuellen Tag aus der Index-DB und weise diese zu..."
        );
        let currentWorkDayPromise = this.GetCurrentDayWork();
        await currentWorkDayPromise;

        this.CurrentDayWorkPromise = currentWorkDayPromise;
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
        this.logger.info("CurrentWorkComponent > LoadAndSetStateGrafic: Wurde aufgerufen");

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

        this.logger.debug("CurrentWorkComponent > LoadAndSetStateGrafic: Ermittle die Arbeitstage vom letzten Monat...");
        let workDays = await this.timeRepositoryService.GetWorkDays(lastMonth, endOfDay);

        this.logger.debug("CurrentWorkComponent > LoadAndSetStateGrafic: Erstelle aus den Arbeitstagen ein SVG und zeige dies an...");
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
        this.logger.info("CurrentWorkComponent > GetCurrentDayWork: Wurde aufgerufen");

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

        this.logger.debug("CurrentWorkComponent > GetCurrentDayWork: Ermittle die Arbeitstage vom letzten Monat...");
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