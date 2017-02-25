export class JIter<T> implements Iterable<T> {
    private source: Iterable<T>;

    public static create<T>(iterable: Iterable<T>): JIter<T> {
        return new JIter<T>(iterable);
    }

    private constructor(source: Iterable<T>) {
        this.source = source;
    }

    public filter(predicate: (item: T) => boolean): JIter<T> {
        return new JIter(filter(this.source, predicate));
    }

    public map<TResult>(mapFn: (item: T) => TResult): JIter<TResult> {
        return new JIter(map(this.source, mapFn));
    }

    public reduce<TResult>(reduceFn: (prev: TResult, current: T) => TResult, initial: TResult): TResult {
        let reduction = initial;
        for (const item of this.source) {
            reduction = reduceFn(reduction, item);
        }
        return reduction;
    }

    public distinct(): JIter<T> {
        return new JIter(distinct(this.source));
    }

    public join<TOuter, TKey, TResult>(
        outer: Iterable<TOuter>,
        innerKeyFn: (item: T) => TKey,
        outerKeyFn: (item: TOuter) => TKey,
        joinFn: (inner: T, outer: TOuter) => TResult
    ): JIter<TResult> {
        return new JIter(join(this.source, outer, innerKeyFn, outerKeyFn, joinFn));
    }

    // This needs to be Symbol.iterator()
    // tslint:disable-next-line:function-name
    public [Symbol.iterator]() {
        return this.source[Symbol.iterator]();
    }
}

function *filter<T>(source: Iterable<T>, predicate: (item: T) => boolean) {
    for (const item of source) {
        if (predicate(item)) {
            yield item;
        }
    }
}

function *map<TInput, TOutput>(source: Iterable<TInput>, mapFn: (item: TInput) => TOutput) {
    for (const item of source) {
        yield mapFn(item);
    }
}

function *join<TInner, TOuter, TKey, TResult>(
    inner: Iterable<TInner>,
    outer: Iterable<TOuter>,
    innerKeyFn: (item: TInner) => TKey,
    outerKeyFn: (item: TOuter) => TKey,
    joinFn: (inner: TInner, outer: TOuter) => TResult
) {
    const innerMap = new Map<TKey, TInner[]>();
    const outerMap = new Map<TKey, TOuter[]>();

    for (const item of inner) {
        const key = innerKeyFn(item);
        const array = innerMap.get(key) || [];
        array.push(item);
        innerMap.set(key, array);
    }
    for (const item of outer) {
        const key = outerKeyFn(item);
        const array = outerMap.get(key) || [];
        array.push(item);
        outerMap.set(key, array);
    }

    for (const [key, innerArray] of innerMap) {
        const outerArray = outerMap.get(key);
        if (outerArray === undefined) {
            continue;
        }
        for (const innerItem of innerArray) {
            for (const outerItem of outerArray) {
                yield joinFn(innerItem, outerItem);
            }
        }
    }
}

function *distinct<T>(source: Iterable<T>) {
    const $set = new Set<T>();
    for (const item of source) {
        if ($set.has(item)) {
            continue;
        }
        $set.add(item);
        yield item;
    }
}
