
export function hasProtocol(s: string): boolean {
    return s.match(/^https?:\/\//) !== null;
}