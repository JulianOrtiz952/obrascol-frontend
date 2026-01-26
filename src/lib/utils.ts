import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCustomNumber(value: number | string): string {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return value.toString();

    // Use a custom formatter: replace commas with nothing first (if string input had them), 
    // but here we deal with raw numbers mostly.
    // Locale string with 'en-US' gives 1,000,000.00
    // We want 1'000,000.00
    // Or users want: " , " for thousands and " ' " for millions?
    // Usersaid: 1,000 (mil) or 1'000,000 (Un millón)
    // So:
    // Millions separator: '
    // Thousands separator: ,

    // Let's implement a manual formatter for this specific requirement.
    const parts = num.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Add thousands separator (comma)
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Now replace the comma that represents millions with an apostrophe
    // Wait, regex above adds commas everywhere. 1,000,000
    // We want 1'000,000
    // So we need to identify the million separators.
    // 1,000,000,000 -> 1,000'000,000 ? No usually it's Billions'Millions,Comp?
    // Colombia usually uses '.' for thousands and ',' for decimals.
    // User requested specific: " , " for thousands and " ' " for millions.
    // 1,000 = 1,000
    // 1,000,000 = 1'000,000
    // 1,000,000,000 = 1,000'000,000 (Maybe?)

    // Let's stick to the prompt example: 1'000,000.
    // This implies we replace the *second* comma from the right with '? No.
    // Let's just do a replace for the specific million barrier?
    // Easier: Format as standard US (1,234,567.89) then replace.
    // 1,000 -> 1,000 (ok)
    // 1,000,000 -> 1'000,000 (ok)
    // 10,000,000 -> 10'000,000 (ok)
    // 100,000,000 -> 100'000,000 (ok)
    // 1,000,000,000 -> 1'000'000,000 ?? Or 1,000'000,000?  "1,000 (mil) o 1'000,000 (Un millón)"

    // I I will assume every 2nd group 1'000,000.
    // Actually, widespread custom format in some regions is indeed ' for millions.

    let formatted = integerPart;
    // Reverse string to count groups
    const reversed = formatted.split('').reverse().join('');
    // 000,000,1
    // We want to replace every 2nd comma with '.
    // Groups of 3 digits + comma.

    let newStr = '';
    let commaCount = 0;
    for (let i = 0; i < reversed.length; i++) {
        const char = reversed[i];
        if (char === ',') {
            commaCount++;
            if (commaCount % 2 === 0) { // 2nd, 4th, 6th comma (millions, trillions?)
                newStr += "'";
            } else {
                newStr += ",";
            }
        } else {
            newStr += char;
        }
    }

    formatted = newStr.split('').reverse().join('');

    // Remove decimals if .00? User didn't specify. Standard is keep them for prices.
    // Let's keep 2 decimals if non-zero, or just one?
    return parts[1] === '00' ? formatted : `${formatted}.${decimalPart}`;
}
