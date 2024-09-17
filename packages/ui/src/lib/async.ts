export type AsyncData<T> =
  | {
      data: T;
      isLoading: false;
      error: undefined;
    }
  | {
      data: undefined;
      isLoading: true;
      error: undefined;
    }
  | {
      data: undefined;
      isLoading: false;
      error: Error;
    };

export type DataPagination = {
  page: number;
  size: number;
};

export type DataSort<TData extends object> = {
  // field: keyof TData;
  order: "asc" | "desc";
};

export type DataQueryInput<TData extends object> = {
  pagination?: DataPagination;
  // sort?: DataSort<TData>[];
};

export type DataQueryResponse<TData extends object> = {
  rows: TData[];
  pagination: DataPagination & { total: number };
  sort: DataSort<TData>[];
};

export type DataEndpoint<TData extends object> = (
  input: DataQueryInput<TData>,
  ...args: any[]
) => AsyncData<DataQueryResponse<TData>>;

export type AsyncDataEndpoint<
  TData extends object,
  TQueryInput,
  TInput,
  TOutput,
> = {
  endpoint: (input: TInput, ...args: any[]) => TOutput;
  mapData: (output: TOutput) => AsyncData<DataQueryResponse<TData>>;
  mapInput: (input: TQueryInput) => TInput;
};
