import { Routes } from '@angular/router';
import { CurrentWorkComponent } from './components/current-work/current-work.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
    { path: "Current", component: CurrentWorkComponent },
    { path: "History", component: HistoryComponent },
    { path: "**", redirectTo: "Current" }
];