
export function getValidURL(link: string): string {
    return link.match(/^https?:\/\//) !== null ? link : `//${link}`;
}