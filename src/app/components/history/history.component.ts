import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, DatePipe } from '@angular/common';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDayOverview } from '../../entities/HistoryDay';
import { TimeSpanPipe } from '../../Pipes/time-span.pipe';
import { ExportHelper } from '../../Helper/ExportHelper';
import { DownloadHelper } from '../../Helper/DownloadHelper';
import { DateHelper } from '../../Helper/DateHelper';
import { Logger } from 'serilogger';
import { LoggerService } from '../../services/Logger/logger.service';
import {MatIconModule} from '@angular/material/icon';
import { LiveTimeSpanDirective } from '../../directives/LiveTimeSpan/live-time-span.directive';

/**
 * Die Zeiten von einem Arbeitstag
 */
interface WorkDayTimes {
    /**
     * Die Zeit vom Arbeitstag als String
     */
    TimeString: string;

    /**
     * Die Überstunden vom Arbeitstag als String
     */
    OverTimeStirng: string;

    /**
     * Die Millisekunden über der normalen Arbeitszeit (kann Negativ sein).
     */
    MillisecondsOvertime: number;
}

/**
 * Eine gruppe von Arbeitstagen
 */
interface WorkDayGroup {
    /**
     * Der Zeitstempel von der Gruppe
     */
    Timestamp: Date;

    /**
     * Die Arbeitstage der Gruppe
     */
    WorkDays: Array<WorkDayOverview>;
}

/**
 * Dictionary mit den Arbeitstagen nach Datum gruppiert
 */
interface WorkDayGrouped {
    [timestamp: number]: WorkDayGroup;
}

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule
    ],
    templateUrl: './history.component.html',
    styleUrl: './history.component.less'
})
export class HistoryComponent
{
    // #region fields
    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

    /**
     * Repository für Arbeitszeiten
     */
    private readonly timeRepositoryService: TimeRepositoryService;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Komponente
     */
    public constructor(
        loggerService: LoggerService,
        timeRepositoryService: TimeRepositoryService)
    {
        this.logger = loggerService.Logger;
        this.timeRepositoryService = timeRepositoryService;

        this.HistoryDaysByMonth = new Array<WorkDayGroup>();
        this.StatusChange = new EventEmitter<void>();

        this.FillDataSource();
    }
    // #endregion

    // #region Outputs
    /**
     * Wird ausgelöst, wenn der Benutzer die History verändert (z.B. Löschen).
     */
    @Output()
    public readonly StatusChange: EventEmitter<void>;
    // #endregion

    // #region HistoryDaysByMonth
    /**
     * Dictionary mit den Arbeitstagen nach Datum gruppiert
     */
    public HistoryDaysByMonth: Array<WorkDayGroup>;
    // #endregion

    // #region DeleteWorkDayEntry
    /**
     * Löscht den Arbeitstag mit dem angegeben Datum
     * 
     * @param date Das Datum vom Arbeitstag, der gelöscht werden soll
     */
    public async DeleteWorkDayEntry(date: Date): Promise<void>
    {
        this.logger.info("HistoryComponent > DeleteWorkDayEntry: Wurde aufgerufen");

        let dateString = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;

        let userMessage = `Element löschen (${dateString})?`;
        this.logger.debug("HistoryComponent > DeleteWorkDayEntry: Frage beim Benutzer nach, ob den Eintrag löschen möchte (\"{0}\")...", userMessage);
        if (confirm(userMessage))
        {
            this.logger.debug("HistoryComponent > DeleteWorkDayEntry: Benutzer hat dem Löschen zugestimmt. Löschte den Eintrag aus der Index-DB...");
            await this.timeRepositoryService.DeleteWorkDay(date);

            this.logger.debug("HistoryComponent > DeleteWorkDayEntry: Aktualisiert die angezeigten Daten...");
            this.FillDataSource();

            this.StatusChange.emit();
        }
        else
        {
            this.logger.verbose("HistoryComponent > DeleteWorkDayEntry: Benutzer hat dem Löschen nicht zugestimmt...");
        }
    }
    // #endregion

    // #region ExportAsCsv
    /**
     * Exportiert die angezeigten Arbeitstage als CSV-Datei (und startet den Download)
     */
    public async ExportAsCsv(): Promise<void>
    {
        this.logger.info("HistoryComponent > ExportAsCsv: Wurde aufgerufen");

        let workDays = new Array<WorkDayOverview>();

        for (let key in this.HistoryDaysByMonth)
        {
            workDays.push(...this.HistoryDaysByMonth[key].WorkDays);
        }

        this.logger.debug("HistoryComponent > ExportAsCsv: Erstelle das CSV anhand der angezeigten Daten...");
        let csvBlob = ExportHelper.WorkDayToCsv(workDays);

        let oldestWorkDate: Date | null = null;
        let latestWorkDate: Date | null = null;

        for (let workDay of workDays)
        {
            if (oldestWorkDate == null || workDay.Date < <Date>oldestWorkDate)
            {
                oldestWorkDate = workDay.Date;
            }

            if (latestWorkDate == null || workDay.Date > <Date>latestWorkDate)
            {
                latestWorkDate = workDay.Date;
            }
        }

        let fileName = `Arbeitszeiten_${DateHelper.FormatDate(oldestWorkDate, "yyyy_MM_dd")}-${DateHelper.FormatDate(latestWorkDate, "yyyy_MM_dd")}.csv`;
        this.logger.debug("HistoryComponent > ExportAsCsv: Downloade die erstellte CSV-Datei ({0})...", fileName);
        await DownloadHelper.DownloadFileBlob(
            csvBlob,
            fileName
        );
    }
    // #endregion

    // #region GetMonthNumberByIndex
    /**
     * Gibt den Monatsnamen anahnd vom Index aus
     * 
     * @param monthIndex Der Index vom Monat
     */
    public GetMonthNumberByIndex(monthIndex: number): string
    {
        switch(monthIndex)
        {
            case 0:
                return "Januar";

            case 1:
                return "Februar";

            case 2:
                return "März";

            case 3:
                return "April";

            case 4:
                return "Mai";

            case 5:
                return "Juni";

            case 6:
                return "Juli";

            case 7:
                return "August";

            case 8:
                return "September";

            case 9:
                return "Oktober";

            case 10:
                return "November";

            case 11:
                return "Dezember";

            default:
                throw new Error(`Der Index ist unbekannt (${monthIndex}).`);
        }
    }
    // #endregion

    // #region GetWeekDayNameByIndex
    /**
     * Ermittelt den Name vom Wochennamen anhand vom Index
     * 
     * @param weekDayIndex Der Index vom Wochentag
     */
    public GetWeekDayNameByIndex(weekDayIndex: number): string
    {
        switch(weekDayIndex)
        {
            case 0:
                return "Sonntag";

            case 1:
                return "Montag";

            case 2:
                return "Dienstag";

            case 3:
                return "Mittwoch";

            case 4:
                return "Donnerstag";

            case 5:
                return "Freitag";

            case 6:
                return "Samstag";

            default:
                throw new Error(`Der Index ist unbekannt (${weekDayIndex}).`);
        }
    }
    // #endregion

    // #region FormatDate
    /**
     * Formatiert das Datum anhand vom String
     * 
     * @param date Das Datum, das formatiert werden soll
     * @param format Das Fromat in dem das Datum formartiert werden soll
     */
    public FormatDate(date: Date, format: string): string
    {
        return DateHelper.FormatDate(date, format)
    }
    // #endregion

    // #region GetWorkTimeSum
    /**
     * Ermittelt die Summe der Arbeitszeit vom Tag
     * 
     * @param workDayOverview Der Arbeitstag, der summiert werden soll
     */
    public GetWorkTimeSum(workDayOverview: WorkDayOverview): WorkDayTimes
    {
        let millisecondsWorked = 0;

        if (workDayOverview.StartToWork != null && workDayOverview.EndToWork != null)
        {
            millisecondsWorked += workDayOverview.EndToWork.getTime() - workDayOverview.StartToWork.getTime();
        }

        if (workDayOverview.StartWork != null && workDayOverview.EndWork != null)
        {
            millisecondsWorked += workDayOverview.EndWork.getTime() - workDayOverview.StartWork.getTime();
        }

        if (workDayOverview.StartToHome != null && workDayOverview.EndToHome != null)
        {
            millisecondsWorked += workDayOverview.EndToHome.getTime() - workDayOverview.StartToHome.getTime();
        }

        let workDayHours = LiveTimeSpanDirective.SplitMillisecondsIntoParts(millisecondsWorked);

        let overTimeMilliseconds = millisecondsWorked - ((8 * 60 + 45) * 60 * 1000);
        let overTimeHours = LiveTimeSpanDirective.SplitMillisecondsIntoParts(overTimeMilliseconds);

        let result: WorkDayTimes = {
            TimeString: `${workDayHours.Hours.toString().padStart(2, "0")}:${workDayHours.Minutes.toString().padStart(2, "0")}`,
            OverTimeStirng: `${overTimeHours.IsNegative ? "-" : ""}${overTimeHours.Hours.toString().padStart(2, "0")}:${overTimeHours.Minutes.toString().padStart(2, "0")}`,
            MillisecondsOvertime: overTimeMilliseconds
        };
        if (overTimeMilliseconds > 0)
        {
            result.OverTimeStirng = "+" + result.OverTimeStirng;
        }

        return result;
    }
    // #endregion

    // #region FillDataSource
    /**
     * Füllt die DatenQuelle von der Tabelle mit den letzten Zeiten
     */
    public async FillDataSource(): Promise<void>
    {
        this.logger.info("HistoryComponent > FillDataSource: Wurde aufgerufen");

        this.logger.debug("HistoryComponent > FillDataSource: Ermittle alle Arbeitstage aus der Index-DB...");
        let workDays = await this.timeRepositoryService.GetWorkDays(new Date(2000, 1, 1), new Date());

        let historyDays = new Array<WorkDayOverview>();

        this.logger.debug("HistoryComponent > FillDataSource: Wandle die Arbeitstage in HistorienTag und zeige diese an...");
        for (let workDay of workDays)
        {
            historyDays.push(TimeRepositoryService.ConvertWorkDayToHistoryDay(workDay));
        }

        let hashTable: WorkDayGrouped = {};
        this.HistoryDaysByMonth = new Array<WorkDayGroup>();
        for (let historyDay of historyDays)
        {
            let monthKey = historyDay.Date.getFullYear() * 12 +  historyDay.Date.getMonth();

            if (typeof hashTable[monthKey] !== "object")
            {
                hashTable[monthKey] = {
                    Timestamp: new Date(
                        historyDay.Date.getFullYear(),
                        historyDay.Date.getMonth(),
                        1
                    ),
                    WorkDays: new Array<WorkDayOverview>()
                };
                this.HistoryDaysByMonth.push(hashTable[monthKey])
            }

            hashTable[monthKey].WorkDays.push(historyDay);
        }

        this.HistoryDaysByMonth.sort((a, b) => { return b.Timestamp.getTime() - a.Timestamp.getTime(); });

        for (let group of this.HistoryDaysByMonth)
        {
            group.WorkDays.sort((a, b) => { return b.Date.getTime() - a.Date.getTime(); })
        }
    }
    // #endregion
}