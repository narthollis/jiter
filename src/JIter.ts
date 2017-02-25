export class JIter<T> implements Iterable<T> {
    private source: Iterable<T>;
    private chain: Iterable<Object>[] = [];

    public static CREATE<T>(iterable: Iterable<T>): JIter<T> {
        return new JIter<T>(iterable);
    }

    private constructor(source: Iterable<T>) {
        this.source = source;
        this.chain.push(source);
    }

    public filter(predicate: (item: T) => boolean): JIter<T> {
        this.source = filter(this.source, predicate);
        this.chain.push(this.source);
        return this;
    }

    public map<TResult>(mapFn: (item: T) => TResult): JIter<TResult> {
        // We are forcibly changing our own type signature here
        // tslint:disable-next-line:no-any prefer-type-cast
        const other = this as any as JIter<TResult>;
        other.source = map(this.source, mapFn);
        other.chain.push(other.source);
        return other;
    }

    public reduce<TResult>(reduceFn: (prev: TResult, current: T) => TResult, initial: TResult): TResult {
        let reduction = initial;
        for (const item of this.source) {
            reduction = reduceFn(reduction, item);
        }
        return reduction;
    }

    public distinct(): JIter<T> {
        this.source = distinct(this.source);
        this.chain.push(this.source);
        return this;
    }

    public join<TOuter, TKey, TResult>(
        outer: Iterable<TOuter>,
        innerKeyFn: (item: T) => TKey,
        outerKeyFn: (item: TOuter) => TKey,
        joinFn: (inner: T, outer: TOuter) => TResult
    ): JIter<TResult> {
        // We are forcibly changing our own type signature here
        // tslint:disable-next-line:no-any prefer-type-cast
        const other = this as any as JIter<TResult>;
        other.source = join(this.source, outer, innerKeyFn, outerKeyFn, joinFn);
        other.chain.push(other.source);
        return other;
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
