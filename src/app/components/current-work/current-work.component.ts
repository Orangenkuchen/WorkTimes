import { Component } from '@angular/core';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDay } from '../../entities/WorkDay';
import { CommonModule } from '@angular/common';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StateDiagramm } from '../../StateDiagramm/StateDiagramm';

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

        this.DayStatusChart = null;

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
                    success({ Date: currentTime, TimeSlots: [] });
                }
            }
        );

        this.MonthlyWorkPromise = new Promise<Array<WorkDay>>(
            async (success, reject) => {
                let workDays = await timeRepositoryService.GetWorkDays(new Date(startOfDay.getFullYear(), startOfDay.getMonth() - 1, startOfDay.getDate()), startOfDay);

                success(workDays);
            }
        );

        this.MonthlyWorkPromise.then((x) => {
            this.DayStatusChart = this.sanitizer.bypassSecurityTrustHtml(StateDiagramm.Create(x).outerHTML);
        });
    }

    public CurrentDayWorkPromise: Promise<WorkDay>;

    public MonthlyWorkPromise: Promise<Array<WorkDay>>;

    public DayStatusChart: SafeHtml | null;

    private async LoadCurrentDayWork(): Promise<void>
    {
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

        let workDays = await this.timeRepositoryService.GetWorkDays(startOfDay, endOfDay);

        
    }
}
