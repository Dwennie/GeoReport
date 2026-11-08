const dateFormatter = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
});

export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return dateTimeFormatter.format(new Date(value));
}

export function formatRelative(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    const diffInSeconds = Math.round(
        (new Date(value).getTime() - Date.now()) / 1000,
    );

    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['week', 60 * 60 * 24 * 7],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
    ];

    for (const [unit, secondsInUnit] of units) {
        if (Math.abs(diffInSeconds) >= secondsInUnit) {
            return relativeFormatter.format(
                Math.round(diffInSeconds / secondsInUnit),
                unit,
            );
        }
    }

    return 'just now';
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-PH').format(value);
}

export function formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
}
