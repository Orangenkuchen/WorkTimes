import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

/**
 * Die Haupt-Komponente
 */
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.less'
})
export class AppComponent
{
    public constructor(router: Router)
    {
        this.CurrentTab = "Current";

        router.events.subscribe(
            (event) => {
                if (event instanceof NavigationEnd)
                {
                    if (event.url.indexOf("Current") !== -1)
                    {
                        this.CurrentTab = "Current";
                    }
                    else if (event.url.indexOf("History") !== -1)
                    {
                        this.CurrentTab = "History";
                    }
                }
            }
        );

    }

    public CurrentTab: string;
}