import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDayOverview } from '../../entities/HistoryDay';
import { TimeSpanPipe } from '../../Pipes/time-span.pipe';

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [MatTableModule, MatSortModule, DatePipe, TimeSpanPipe],
    templateUrl: './history.component.html',
    styleUrl: './history.component.less'
})
export class HistoryComponent implements AfterViewInit
{
    // #region fields
    /**
     * Repository für Arbeitszeiten
     */
    private readonly timeRepositoryService: TimeRepositoryService;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Komponente
     */
    public constructor(timeRepositoryService: TimeRepositoryService)
    {
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
        let dateString = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}`;

        if (confirm(`Element löschen (${dateString})?`))
        {
            await this.timeRepositoryService.DeleteWorkDay(date);

            this.FillDataSource();
        }
    }
    // #endregion

    // #region FillDataSource
    /**
     * Füllt die DatenQuelle von der Tabelle mit den letzten Zeiten
     */
    private async FillDataSource(): Promise<void>
    {
        let workDays = await this.timeRepositoryService.GetWorkDays(new Date(2000, 1, 1), new Date());

        let historyDays = new Array<WorkDayOverview>();

        for (let workDay of workDays)
        {
            historyDays.push(TimeRepositoryService.ConvertWorkDayToHistoryDay(workDay));
        }

        this.DataSource.data = historyDays;
    }
    // #endregion
}