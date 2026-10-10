export function roundNumber(input: number, digits: number): number {
    const precision = 10**digits;
    return Math.round(input*precision)/precision;
}