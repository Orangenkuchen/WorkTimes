import { Injectable } from '@angular/core';
import { Logger, LoggerConfiguration } from 'serilogger';
import { BrowserColoredConsoleSink } from '../../serilogSinks/BrowserColoredConsoleSink';

/**
 * Service für Lognachrichten
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {

    // #region ctor
    /**
     * Initialisiert die Klasse
     */
    public constructor() 
    {
        this.Logger = new LoggerConfiguration()
                        .writeTo(new BrowserColoredConsoleSink(
                            {
                                includeProperties: true,
                                includeTimestamps: true
                            }
                        ))
                        .create();
    }
    // #endregion

    // #region Logger
    /**
     * Serilogger für Lognachrichten
     */
    public Logger: Logger
    // #endregion
}
