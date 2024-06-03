import { twoDigits } from "./two-digits";

export function formatDuration(start: Date, end: Date) {
    const durationMs = end.getTime() - start.getTime();

    var hours = Math.floor(durationMs / (1000 * 60 * 60));
    var minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
}
