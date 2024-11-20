import { Component } from '@angular/core';
import { TimeRepositoryService } from '../../services/time-repository/time-repository.service';
import { WorkDay } from '../../entities/WorkDay';
import { CommonModule } from '@angular/common';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { DomSanitizer } from '@angular/platform-browser';
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
            this.ChartOptions = this.sanitizer.bypassSecurityTrustHtml(StateDiagramm.Create([x, x, x]).outerHTML);
        });
    }

    public CurrentDayWorkPromise: Promise<WorkDay>;

    public ChartOptions: any;

    
}
