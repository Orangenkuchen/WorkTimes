import { Injectable } from '@angular/core';
import { WorkDay } from '../../entities/WorkDay';
import { WorkDayOverview } from '../../entities/HistoryDay';
import { TimeSliceType } from '../../entities/TimeSliceType';
import { Logger } from 'serilogger';
import { LoggerService } from '../Logger/logger.service';

/**
 * Repository für Arbeitszeiten
 */
@Injectable({
    providedIn: 'root'
})
export class TimeRepositoryService
{
    // #region fields
    /**
     * Service für Lognachrichten
     */
    private readonly logger: Logger;

    /**
     * Promise für die Index-DB
     */
    private readonly databasePromise: Promise<IDBDatabase>;
    // #endregion

    // #region ctor
    /**
     * Initialisiert den Service
     *
     * @param loggerService Service für Lognachrichten
     */
    public constructor(loggerService: LoggerService)
    {
        this.logger = loggerService.Logger;

        this.logger.debug("TimeRepositoryService > ctor: Wurde aufgerufen");

        this.databasePromise = new Promise(
            (resolve, reject) =>
            {
                const dbName = "WorkTimeDb";
                const indexDbVersion = 1;

                this.logger.debug("TimeRepositoryService > ctor: Öffne die Index-DB (Name: {0}; Version: {1})", dbName, indexDbVersion);
                let openDbRequest = window.indexedDB.open(dbName, indexDbVersion);

                openDbRequest.onsuccess = () =>
                {
                    this.logger.verbose("TimeRepositoryService > ctor: Datenbank wurde erfolgreich geöffnet");
                    resolve(openDbRequest.result);
                };

                openDbRequest.onerror = (event) =>
                {
                    let error = (<any>event?.target)?.error;

                    if (error instanceof Error == false)
                    {
                        error = new Error(error.toString());
                    }

                    this.logger.error(error, "TimeRepositoryService > ctor: Fehler beim Öffnen der Datenbank");
                    reject((<any>event?.target)?.error);
                };

                openDbRequest.onupgradeneeded = (event) =>
                {
                    this.logger.verbose("TimeRepositoryService > ctor: Die Datenbank benötigt ein Updgrade...");
                    this.OnUpgradeNeeded(event);
                }
            }
        );
    }
    // #endregion

    // #region static ConvertWorkDayToHistoryDay
    /**
     * Wandelt einen {@link WorkDay} in einen {@link WorkDayOverview} um
     * 
     * @param workDay Der WorkDay, der umgewandelt werden soll
     * @returns Gibt den WorkDayOverview zurück
     */
    public static ConvertWorkDayToHistoryDay(workDay: WorkDay): WorkDayOverview
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

        let workDayOverview = <WorkDayOverview> {
            Date: workDay.Date,
            StartToWork: null,
            EndToWork: null,
            StartWork: null,
            EndWork: null,
            StartToHome: null,
            EndToHome: null,
            WorkTimeMs: 0,
            DriveTimeMs: 0
        };

        if (transfers.length >= 1)
        {
            workDayOverview.StartToWork = transfers[0].Start;
            workDayOverview.EndToWork = transfers[0].End;

            if (transfers[0].Start != null && transfers[0].End != null)
            {
                workDayOverview.DriveTimeMs += transfers[0].End.getTime() - transfers[0].Start.getTime();
            }
        }

        if (workTimes.length >= 1)
        {
            workDayOverview.StartWork = workTimes[0].Start;
            workDayOverview.EndWork = workTimes[0].End;

            if (workTimes[0].Start != null && workTimes[0].End != null)
            {
                workDayOverview.WorkTimeMs += workTimes[0].End.getTime() - workTimes[0].Start.getTime();
            }
        }

        if (transfers.length >= 2)
        {
            workDayOverview.StartToHome = transfers[1].Start;
            workDayOverview.EndToHome = transfers[1].End;

            if (transfers[1].Start != null && transfers[1].End != null)
            {
                workDayOverview.DriveTimeMs += transfers[1].End.getTime() - transfers[1].Start.getTime();
            }
        }

        return workDayOverview;
    }
    // #endregion

    // #region GetWorkDays
    /**
     * Ermittelt alle Arbeitszeiten, welche innerhalb des Zeitfensters sind
     * 
     * @param from Der Anfang vom Zeitfenster
     * @param to Das Ende vom Zeitfenster
     * @returns Gibt einen Array von Arbeitszeiten zurück
     */
    public async GetWorkDays(from: Date, to: Date): Promise<Array<WorkDay>>
    {
        let database = await this.databasePromise;

        let workTimesObjectStore = database.transaction("WorkTimes", "readonly").objectStore("WorkTimes");

        return await new Promise<Array<WorkDay>>(
            (success, reject) =>
            {
                let request = workTimesObjectStore.getAll(IDBKeyRange.bound(from.getTime(), to.getTime()))

                request.onsuccess = () =>
                {
                    for (let workDay of <Array<WorkDay>>request.result)
                    {
                        workDay.Date = this.ParseToDate(workDay.Date);

                        for (let timeSlots of workDay.TimeSlots)
                        {
                            if (timeSlots.Start != null)
                            {
                                timeSlots.Start = this.ParseToDate(timeSlots.Start);
                            }

                            if (timeSlots.End != null)
                            {
                                timeSlots.End = this.ParseToDate(timeSlots.End);
                            }
                        }
                    }

                    success(request.result);
                };

                request.onerror = (event) =>
                {
                    reject((<any>event?.target)?.error);
                };
            }
        );
        
    }
    // #endregion

    // #region PutWorkDay
    /**
     * Setzt den Arbeitstag in der Tabelle
     * 
     * @param workDay Der Arbeitstag, der gesetzt werden soll
     */
    public async PutWorkDay(workDay: WorkDay): Promise<void>
    {
        let database = await this.databasePromise;

        let workTimesObjectStore = database.transaction("WorkTimes", "readwrite").objectStore("WorkTimes");

        await new Promise<void>(
            (success, reject) =>
            {
                let request = workTimesObjectStore.put(workDay, workDay.Date.getTime());

                request.onsuccess = () =>
                {
                    success();
                };

                request.onerror = (event) =>
                {
                    reject((<any>event?.target)?.error);
                };
            }
        );
    }
    // #endregion

    // #region DeleteWorkDay
    /**
     * Löscht den Arbeitstag aus der Tabelle
     * 
     * @param date Das Datum vom Arbeitstag, der gelöscht werden soll
     */
    public async DeleteWorkDay(date: Date): Promise<void>
    {
        let database = await this.databasePromise;

        let workTimesObjectStore = database.transaction("WorkTimes", "readwrite").objectStore("WorkTimes");
        let deleteRequest = workTimesObjectStore.delete(date.getTime());

        await new Promise<void>(
            (success, reject) =>
            {
                deleteRequest.onsuccess = () =>
                {
                    success();
                };

                deleteRequest.onerror = (event) =>
                {
                    reject((<any>event?.target)?.error);
                };
            }
        );
    }
    // #endregion

    // #region OnUpgradeNeeded
    /**
     * Wird aufgerufen, wenn die Datenbank geupgraded werden muss.
     * 
     * @param event Das VersionChangeEvent
     */
    private OnUpgradeNeeded(event: IDBVersionChangeEvent): void
    {
        this.logger.debug(
            "TimeRepositoryService > OnUpgradeNeeded: Wurde aufgerufen (OldVersion: {0}; NewVersion: {1}). Führt die notwendigen upgrades durch",
            event.oldVersion,
            event.newVersion
        );

        for (let version = event.oldVersion + 1; version <= (event.newVersion ?? event.oldVersion); version++)
        {
            switch(version)
            {
                case 1:
                    this.UpgradeVersion0To1((<any>event.target).result);
                    break;

                default:
                    var error = new Error(`Für die Versionsnummer ${version} existiert keine Migration.`);

                    this.logger.error(error, "Fehler beim Upgraden der Index-DB");
                    break;
            }
        }
    }
    // #endregion

    // #region UpgradeVersion0To1
    /**
     * Erstellt die Datenbank auf die Version 1
     * 
     * @param database Die Datenbank in der die ObjectStores erstellt werden sollen.
     */
    public UpgradeVersion0To1(database: IDBDatabase): void
    {
        const objectStoreName = "WorkTimes";
        const properties: IDBObjectStoreParameters = { autoIncrement: true };

        this.logger.verbose(
            "TimeRepositoryService > UpgradeVersion0To1: Wurde aufgerufen. Füge die Tabelle {0} ({@1})...",
            objectStoreName,
            properties
        );
        let workTimesObjectStore = database.createObjectStore(objectStoreName, properties);

        this.logger.verbose("TimeRepositoryService > UpgradeVersion0To1: Füge den Index \"Date\" zum ObjectStore hinzu...");
        workTimesObjectStore.createIndex("Date", "Date");
    }
    // #endregion

    // #region ParseToDate
    /**
     * Wandelt eine Datum, welches im Format JSON-String oder Millisekunden seit 1970 in Date um.
     * 
     * @param date Das Datum, dass umgewandelt werden soll
     */
    private ParseToDate(date: Date | number | string): Date
    {
        if (typeof date === "number" || typeof date === "string")
        {
            return new Date(date);
        }
        else
        {
            return date;
        }
    }
    // #endregion
}