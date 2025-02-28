import { Component } from '@angular/core';
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
export class DashboardComponent {

}
