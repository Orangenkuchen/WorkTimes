import { Pipe, PipeTransform } from '@angular/core';
import { LiveTimeSpanDirective } from '../directives/LiveTimeSpan/live-time-span.directive';

@Pipe({
    name: 'timeSpanPipe',
    standalone: true
})
export class TimeSpanPipe implements PipeTransform {

    transform(value: number, ...args: unknown[]): string
    {
        let timeParts = LiveTimeSpanDirective.SplitMillisecondsIntoParts(value);

        return `${timeParts.Hours.toString().padStart(2, "0")}:${timeParts.Minutes.toString().padStart(2, "0")}`;
    }

}
