import { twoDigits } from "./two-digits";

export function formatDuration(start: Date, end: Date) {
    const durationMs = end.getTime() - start.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
}
