import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDayOverview } from '../../entities/HistoryDay';
import { TimeSpanPipe } from '../../Pipes/time-span.pipe';
import { ExportHelper } from '../../Helper/ExportHelper';
import { DownloadHelper } from '../../Helper/DownloadHelper';
import { DateHelper } from '../../Helper/DateHelper';
import { Logger } from 'serilogger';
import { LoggerService } from '../../services/Logger/logger.service';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [
        MatTableModule,
        MatButtonModule,
        MatSortModule,
        MatIconModule,
        DatePipe,
        TimeSpanPipe
    ],
    templateUrl: './history.component.html',
    styleUrl: './history.component.less'
})
export class HistoryComponent implements AfterViewInit
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

        this.DataSource = new MatTableDataSource<WorkDayOverview>();

        this.DisplayedColumns = new Array<string>(
            "Date",
            "ToWork",
            "Work",
            "ToHome",
            "WorkTime",
            "DriveTime",
            "Remove"
        );

        this.FillDataSource();
    }
    // #endregion

    // #region ngAfterViewInit
    /**
     * Wird aufgerufen, nach dem die View initialsiert wurde
     */
    public ngAfterViewInit()
    {
        this.logger.info("HistoryComponent > ngAfterViewInit: Wurde aufgerufen");

        this.DataSource.sort = this.Sort;
    }
    // #endregion

    // #region Sort
    /**
     * Container for MatSortables to manage the sort state and provide default sort parameters.
     */
    @ViewChild(MatSort) Sort!: MatSort;
    // #endregion

    // #region DisplayedColumns
    /**
     * Array mit den Namen von den Spalten, die angezeigt werden sollen
     */
    public DisplayedColumns: Array<string>;
    // #endregion

    // #region DataSource
    /**
     * Die Datenquelle von der Tabelle
     */
    public DataSource: MatTableDataSource<WorkDayOverview>;
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

        this.logger.debug("HistoryComponent > ExportAsCsv: Erstelle das CSV anhand der angezeigten Daten...");
        let csvBlob = ExportHelper.WorkDayToCsv(this.DataSource.data);

        let oldestWorkDate: Date | null = null;
        let latestWorkDate: Date | null = null;

        for (let workDay of this.DataSource.data)
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

    // #region FillDataSource
    /**
     * Füllt die DatenQuelle von der Tabelle mit den letzten Zeiten
     */
    private async FillDataSource(): Promise<void>
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

        this.DataSource.data = historyDays;
    }
    // #endregion
}