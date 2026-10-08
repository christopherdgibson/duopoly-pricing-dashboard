interface FormatCurrencyProps<T> {
  obj: T;
  excludedKeys?: (keyof T)[];
  NaNKeys?: (keyof T)[];
}

const failMessage = "No solution with current parameters";

export function formatCurrencyValues<T extends object>(
  {obj, excludedKeys = [], NaNKeys = []}: FormatCurrencyProps<T>
): Record<keyof T, string | number> {
  const result = { ...obj } as Record<keyof T, string | number>;

  for (const key in obj) {
    const typedKey = key as keyof T;
    const val = obj[typedKey];

    if (typeof val === 'number' && ![...excludedKeys, ...NaNKeys].includes(typedKey)) {
      result[typedKey] = formatCurrencyValue(val);
    }

    if (typeof val === 'number' && NaNKeys.includes(typedKey)) {
      result[typedKey] = failMessage;
    }
  }

  return result;
}

export function formatCurrencyValue(value: number) {
  return currencyFormatter.format(value);
}

const currencyFormatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function getNaNKeys<T extends object>(obj: T | null): (keyof T)[] {
  const NaNKeys: (keyof T)[] = [];

  for (const key in obj) {
    const typedKey = key as keyof T;
    const val = obj[typedKey];
    if (typeof val === 'number' && Number.isNaN(val)) {
      NaNKeys.push(typedKey);
    }
  }

  return NaNKeys;
}
