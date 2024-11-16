import { Injectable } from '@angular/core';
import { WorkDay } from '../../entities/WorkDay';

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
     * Promise für die Index-DB
     */
    private readonly databasePromise: Promise<IDBDatabase>;
    // #endregion

    // #region ctor
    /**
     * Initialisiert den Service
     */
    public constructor()
    {
        this.databasePromise = new Promise(
            (resolve, reject) =>
            {
                let openDbRequest = window.indexedDB.open("WorkTimeDb", 1);

                openDbRequest.onsuccess = () =>
                {
                    resolve(openDbRequest.result);
                };

                openDbRequest.onerror = (event) =>
                {
                    reject((<any>event?.target)?.error);
                };

                openDbRequest.onupgradeneeded = (event) =>
                {
                    this.OnUpgradeNeeded(event);
                }
            }
        );
        this.databasePromise.then(
            (database) =>
            {
                
            }
        );
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
                let request = workTimesObjectStore.index("Date").getAll(IDBKeyRange.bound(from, to))

                request.onsuccess = () =>
                {
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

        let workTimesObjectStore = database.transaction("WorkTimes", "readonly").objectStore("WorkTimes");

        await new Promise<void>(
            (success, reject) =>
            {
                let request = workTimesObjectStore.put(workDay, workDay.Date);

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

        let workTimesObjectStore = database.transaction("WorkTimes", "readonly").objectStore("WorkTimes");
        let entry = workTimesObjectStore.index("Date").get(date).result;

        await new Promise<void>(
            (success, reject) =>
            {
                let request = workTimesObjectStore.delete(entry.id);

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

    // #region OnUpgradeNeeded
    /**
     * Wird aufgerufen, wenn die Datenbank geupgraded werden muss.
     * 
     * @param event Das VersionChangeEvent
     */
    private OnUpgradeNeeded(event: IDBVersionChangeEvent): void
    {
        for (let version = event.oldVersion + 1; version <= (event.newVersion ?? event.oldVersion); version++)
        {
            switch(version)
            {
                case 1:
                    this.UpgradeVersion0To1((<any>event.target).result);
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
        let workTimesObjectStore = database.createObjectStore("WorkTimes", { autoIncrement: true });

        workTimesObjectStore.createIndex("Date", "DriveToWorkStart");
    }
    // #endregion
}