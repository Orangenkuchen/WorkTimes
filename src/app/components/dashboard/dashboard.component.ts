import { Component, ViewChild } from '@angular/core';
import { HistoryComponent } from '../history/history.component';
import { CurrentWorkComponent } from '../current-work/current-work.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CurrentWorkComponent,
        HistoryComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.less'
})
export class DashboardComponent
{
    // #region CurrentWork
    /**
     * Die CurrentWorkComponent, welche im Template verwendet wird.
     */
    @ViewChild("CurrentWork", { static: true })
    public CurrentWork!: CurrentWorkComponent;
    // #endregion

    // #region Hisotry
    /**
     * Die CurrentWorkComponent, welche im Template verwendet wird.
     */
    @ViewChild("Hisotry", { static: true })
    public Hisotry!: HistoryComponent;
    // #endregion

    // #region HandleOnWorkElementChanged
    /**
     * Wird aufgerufen, wenn eine Arbeitszeit in den Child-Components verändert wird.
     * Löst dann in den anderen Children die aktualsierung aus.
     */
    public async HandleOnWorkElementChanged(): Promise<void>
    {
        await this.CurrentWork.RefreshCurrentDayAndTimeStatus();
        await this.Hisotry.FillDataSource();
    }
    // #endregion
}