import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet, RoutesRecognized } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Logger } from 'serilogger';
import { LoggerService } from './services/Logger/logger.service';

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
    // #region fields
    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

    /**
     * Subscribe to update notifications from the Service Worker, trigger update checks, and forcibly activate updates.
     */
    private readonly swUpdate: SwUpdate;
    // #endregion

    // #region ctor
    /**
     * Initialisiert die Hauptkomponente
     * 
     * @param router A service that provides navigation among views and URL manipulation capabilities.
     * @param swUpdate Subscribe to update notifications from the Service Worker, trigger update checks, and forcibly activate updates.
     * @param loggerService Service für Lognachrichten
     */
    public constructor(
        router: Router,
        swUpdate: SwUpdate,
        loggerService: LoggerService)
    {
        this.logger = loggerService.Logger;
        this.swUpdate = swUpdate;

        this.logger.info("AppComponent > ctor: Anwendung wird gestartet.");

        this.CurrentTab = "Current";

        router.events.forEach(
            (event) =>
            {
                if (event instanceof NavigationStart)
                {
                    let navigationStartEvent = event as NavigationStart;
                    this.logger.info(
                        "Angular hat die Navigation gestartet. (Navigationsurl: {url})", 
                        navigationStartEvent.url);
                }
                else if  (event instanceof NavigationEnd)
                {
                    let navigationEndEvent = event as NavigationEnd;
                    this.logger.info(
                        "Angular hat die Navigation abgeschlossen. (Navigationsurl: {url}; UrlAfterRedirects: {urlAfterRedirects})", 
                        navigationEndEvent.url, 
                        navigationEndEvent.urlAfterRedirects);
                }
                else if  (event instanceof NavigationCancel)
                {
                    let navigationCancelEvent = event as NavigationCancel;
                    this.logger.info(
                        "Angular hat die Navigation abgebrochen. (Navigationsurl: {url}; Grund: {reason})", 
                        navigationCancelEvent.url, 
                        navigationCancelEvent.reason);
                }
                else if  (event instanceof NavigationError)
                {
                    let navigationErrorEvent = event as NavigationError;
                    this.logger.error(
                        navigationErrorEvent.error, 
                        "Angular hat beim Navigieren einen Fehler festgestellt. (Navigationsurl: {url})", 
                        navigationErrorEvent.url);
                }
                else if  (event instanceof RoutesRecognized)
                {
                    let navigationRoutesRecognizedEvent = event as RoutesRecognized;
                    this.logger.info(
                        "Angular hat die Router der Navigation verarbeitet. (Navigationsurl: {url}; UrlAfterRedirects: {urlAfterRedirects}; State: {state})", 
                        navigationRoutesRecognizedEvent.url, 
                        navigationRoutesRecognizedEvent.urlAfterRedirects, 
                        navigationRoutesRecognizedEvent.state);
                }
            }
        );

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

        this.RegisterServiceWorkerHandler();
    }
    // #endregion

    // #region CurrentTab
    /**
     * Der aktuelle Tag, der ausgewählt ist
     */
    public CurrentTab: string;
    // #endregion

    // #region RegisterServiceWorkerHandler
    /**
     * Registriert Handler am ServiceWorker zum Loggen und aktualisieren der Webseite beim ServiceWorker update.
     */
    private RegisterServiceWorkerHandler(): void
    {
        this.logger.verbose("AppComponent > RegisterServiceWorkerHandler: Registriere Handler für Updates auf ServiceWorker...");

        this.swUpdate.versionUpdates.subscribe(
            (event) =>
            {
                switch (event.type) {
                    case 'VERSION_DETECTED':
                        this.logger.verbose(
                            "ServiceWorker: Es ist eine neue Version vom ServiceWorker verfügbar ({0}). Downloade diese...",
                            event.version
                        );
                        break;

                    case 'VERSION_READY':
                        this.logger.verbose(
                            "ServiceWorker: Es ist eine neue vom ServiceWorker heruntergeladen (Alt: {0}; " +
                            "Neu: {1}). Frage den User, ob er die Seite neu laden möchte...",
                            event.latestVersion.hash,
                            event.currentVersion.hash
                        );

                        if (confirm("Es ist eine neue Version von der Anwendung verfügbar.\n\nJetzt die Anwendung aktualisieren?"))
                        {
                            this.logger.verbose("ServiceWorker: Der Benutzer hat dem aktualisieren der App zugestimmt. Führe einen Reload durch...");
                            document.location.reload();
                        }
                        else
                        {
                            this.logger.verbose("ServiceWorker: Der Benutzer hat dem aktualisieren der App nicht zugestimmt.");
                        }
                        break;

                    case 'VERSION_INSTALLATION_FAILED':
                        let error = new Error(event.error);

                        this.logger.error(
                            error,
                            "ServiceWorker: Es ist ein Fehler bei der installation der neuen Version aufgetreten ({0})",
                            event.version.hash
                        );
                        break;

                    case 'NO_NEW_VERSION_DETECTED':
                        this.logger.verbose("ServiceWorker: Es ist keine neue Version verfügbar.");
                        break;
                  }
            }
        );
    }
    // #endregion
}