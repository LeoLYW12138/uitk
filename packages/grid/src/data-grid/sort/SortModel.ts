import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import { createHandler, createHook } from "../../grid";
import { SortFn } from "../DataGridModel";

export interface SortColumn<T> {
  name: string;
  field: keyof T;
}

export type SortDirection = "ascending" | "descending";

export class SortItemModel<T> {
  public readonly column$: BehaviorSubject<SortColumn<T> | undefined>;
  public readonly order$: BehaviorSubject<SortDirection>;
  public readonly columns: SortColumn<T>[];

  public readonly useColumn: () => SortColumn<T> | undefined;
  public readonly setColumn: (column: SortColumn<T> | undefined) => void;
  public readonly useOrder: () => SortDirection;
  public readonly setOrder: (order: SortDirection) => void;

  constructor(columns: SortColumn<T>[]) {
    this.columns = columns;
    this.order$ = new BehaviorSubject<SortDirection>("ascending");
    this.column$ = new BehaviorSubject<SortColumn<T> | undefined>(undefined);

    this.useColumn = createHook(this.column$);
    this.setColumn = createHandler(this.column$);
    this.useOrder = createHook(this.order$);
    this.setOrder = createHandler(this.order$);
  }
}

function createSortFn<T>(column?: SortColumn<T>, order?: SortDirection) {
  if (!column || !order) {
    return () => 0;
  }
  console.log(
    `Creating sort function. column: ${column.name}, order: ${order}`
  );
  return (a: T, b: T) => {
    const f = column.field;
    let r = 0;
    if (a[f] < b[f]) {
      r = -1;
    } else if (a[f] > b[f]) {
      r = 1;
    }
    if (order === "descending") {
      r = -r;
    }
    return r;
  };
}

export class SortModel<T> {
  public readonly items$: BehaviorSubject<SortItemModel<T>[]>;
  public readonly useItems: () => SortItemModel<T>[];
  public readonly columns: SortColumn<T>[];
  public readonly sortFn$: BehaviorSubject<SortFn<T> | undefined>;
  public readonly useSortFn: () => SortFn<T> | undefined;

  constructor(columns: SortColumn<T>[]) {
    this.columns = columns;
    this.items$ = new BehaviorSubject<SortItemModel<T>[]>([
      new SortItemModel<T>(this.columns),
    ]);
    this.useItems = createHook(this.items$);
    this.sortFn$ = new BehaviorSubject<SortFn<T> | undefined>(undefined);
    this.useSortFn = createHook(this.sortFn$);

    this.items$
      .pipe(
        map((items) => {
          const partialSortFns = items.map((item) => {
            return combineLatest([item.column$, item.order$]).pipe(
              map(([column, order]) => {
                return createSortFn(column, order);
              })
            );
          });
          return combineLatest(partialSortFns).pipe(
            map((partialSortFns) => {
              return function (a: T, b: T) {
                for (let fn of partialSortFns) {
                  const c = fn(a, b);
                  if (c != 0) {
                    return c;
                  }
                }
                return 0;
              };
            })
          );
        }),
        switchMap((x) => x)
      )
      .subscribe((fn) => {
        this.sortFn$.next(fn);
      });
  }

  public addItem(rowIndex: number) {
    const item = new SortItemModel(this.columns);
    let items = this.items$.getValue();
    items = [
      ...items.slice(0, rowIndex + 1),
      item,
      ...items.slice(rowIndex + 1),
    ];
    this.items$.next(items);
  }

  public deleteItem(itemIndex: number) {
    let items = this.items$.getValue();
    if (items.length === 1) {
      items[0].setColumn(undefined);
      return;
    }
    items = [...items.slice(0, itemIndex), ...items.slice(itemIndex + 1)];
    this.items$.next(items);
  }
}
