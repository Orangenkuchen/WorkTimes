import { Routes } from '@angular/router';
import { HistoryComponent } from './components/history/history.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    { path: "Dashboard", component: DashboardComponent },
    { path: "**", redirectTo: "Dashboard" }
];