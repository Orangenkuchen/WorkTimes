import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { LiveTimeSpanDirective } from '../../directives/LiveTimeSpan/live-time-span.directive';

interface HistoryDay
{
    Date: Date;

    StartToWork: string;

    StartWork: string;

    StartToHome: string;

    EndToHome: string;

    WorkTime: string;

    DriveTime: string;
}

@Component({
    selector: 'app-history',
    standalone: true,
    imports: [MatTableModule, MatSortModule, DatePipe],
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

        this.DataSource = new MatTableDataSource<HistoryDay>();

        this.DisplayedColumns = new Array<string>(
            "Date",
            "StartToWork",
            "StartWork",
            "StartToHome",
            "EndToHome",
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
    public DataSource: MatTableDataSource<HistoryDay>;
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

        let historyDays = new Array<HistoryDay>();

        for (let workDay of workDays)
        {
            let transfers = workDay.TimeSlots.filter(
                (x) => 
                {
                    return x.Type == TimeSliceType.Transfer;
                }
            );
            let workTimes = workDay.TimeSlots.filter(
                (x) =>
                {
                    return x.Type == TimeSliceType.Work;
                }
            );

            let historyDay = <HistoryDay> {
                Date: workDay.Date,
                StartToWork: "",
                StartWork: "",
                StartToHome: "",
                EndToHome: "",
                WorkTime: "",
                DriveTime: ""
            };

            let transferMilliseconds = 0;
            let workMilliseconds = 0;

            if (transfers.length >= 1)
            {
                if (transfers[0].Start != null)
                {
                    historyDay.StartToWork = `${transfers[0].Start.getHours().toString().padStart(2, "0")}:${transfers[0].Start.getMinutes().toString().padStart(2, "0")}`;
                }

                if (transfers[0].Start != null && transfers[0].End != null)
                {
                    transferMilliseconds += transfers[0].End.getTime() - transfers[0].Start.getTime();
                }
            }

            if (workTimes.length >= 1)
            {
                if (workTimes[0].Start != null)
                {
                    historyDay.StartWork = `${workTimes[0].Start.getHours().toString().padStart(2, "0")}:${workTimes[0].Start.getMinutes().toString().padStart(2, "0")}`;
                }

                if (workTimes[0].Start != null && workTimes[0].End != null)
                {
                    workMilliseconds += workTimes[0].End.getTime() - workTimes[0].Start.getTime();
                }
            }

            if (transfers.length >= 2)
            {
                if (transfers[1].Start != null)
                {
                    historyDay.StartToHome = `${transfers[1].Start.getHours().toString().padStart(2, "0")}:${transfers[1].Start.getMinutes().toString().padStart(2, "0")}`;
                }

                if (transfers[1].End != null)
                {
                    historyDay.EndToHome = `${transfers[1].End.getHours().toString().padStart(2, "0")}:${transfers[1].End.getMinutes().toString().padStart(2, "0")}`;
                }

                if (transfers[1].Start != null && transfers[1].End != null)
                {
                    transferMilliseconds += transfers[1].End.getTime() - transfers[1].Start.getTime();
                }
            }

            let transferTimeFragments = LiveTimeSpanDirective.SplitMillisecondsIntoParts(transferMilliseconds);
            let workTimeFragments = LiveTimeSpanDirective.SplitMillisecondsIntoParts(workMilliseconds);

            historyDay.DriveTime = `${transferTimeFragments.Hours.toString().padStart(2, "0")}:${transferTimeFragments.Minutes.toString().padStart(2, "0")}`;
            historyDay.WorkTime = `${workTimeFragments.Hours.toString().padStart(2, "0")}:${workTimeFragments.Minutes.toString().padStart(2, "0")}`;

            historyDays.push(historyDay);
        }

        this.DataSource.data = historyDays;
    }
    // #endregion
}