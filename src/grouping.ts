/**
 * Contains Iterable wrapping functions for grouping behavior
 */

export interface IGrouping<TKey, T> extends Iterable<T> {
    key: TKey;
}

/**
 * Iterable group container
 * @template TKey Group Key Type
 * @template T Group Item Type
 */
class Grouping<TKey, T> implements IGrouping<TKey, T> {
    public key: TKey;
    private items: T[];

    public constructor(key: TKey, items: T[]) {
        this.key = key;
        this.items = items;
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }
}

export function *groupBy<T, TKey>(source: Iterable<T>, keyFn: (item: T) => TKey): Iterable<IGrouping<TKey, T>> {
    const map = new Map<TKey, T[]>();
    for (const item of source) {
        const key = keyFn(item);
        let group = map.get(key);
        if (group === undefined) {
            group = [];
            map.set(key, group);
        }
    }
    for (const [key, values] of map) {
        yield new Grouping(key, values);
    }
}
