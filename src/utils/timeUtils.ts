export function formatTimeAgo(timestamp: Date | string): string {
    const now = new Date();
    const then = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    const interval = Math.floor(seconds / 60);

    if (interval < 1) {
        return "just now";
    }

    if (interval < 60) {
        return `${interval} minutes ago`;
    }

    const hours = Math.floor(interval / 60);
    if (hours < 24) {
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} days ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks}w ago`;
    }

    const months = Math.floor(weeks / 4);
    if (months < 12) {
        return `${months}mo ago`;
    }

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}
