export type Projection<T, TProjection> = (item: T) => TProjection;
export type IndexProjection<T, TProjection> = (item: T, index: number) => TProjection;

export type Comparator<T> = (a: T, b: T) => number;
