/**
 * Beinhaltet Funktionen, welche beim Download nützlich sind
 */
export class DownloadHelper
{
    // #region DownloadFileBlob
    /**
     * Öffnet für den Datei-Blob den Speicherdialg/Downloaddialog
     * 
     * @param fileBlob Der Datei-Blob, welcher gepsichert werden soll
     * @param displayFileName Der Dateiname unter dem der Blob gespeichert werden soll
     */
    public static async DownloadFileBlob(fileBlob: Blob, displayFileName: string): Promise<void>
    {
        // Erstellt ein aElement. Nur aElemente können nativ downloaden
        let aElement = document.createElement("a");

        // Erstellt für den Blob eine lokale temporäre Url
        let objectUrl = URL.createObjectURL(fileBlob);

        // Weise dem aElement die lokale temporäre Url zu
        aElement.href = objectUrl;

        // Weise dem aElement dne Namen zu, unter dem die Datei heruntergeladen werden soll
        aElement.download = displayFileName;

        // this is necessary as link.click() does not work on the latest firefox
        aElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        // Skip to end of execution queue, to give the click a chance to be processed
        await new Promise<void>((success, fail) =>
        {
            setTimeout(() => success(), 0);
        });

        // Entferne die lokale temporäre Url wieder. Der bereits aktive Download wird amit nicht abgebrochen.
        URL.revokeObjectURL(objectUrl);

        // Entferene das aElement aus dem Speicher
        aElement.remove();
    }
    // #endregion
}