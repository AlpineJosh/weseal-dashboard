import type {
  InferQueryLikeData,
  InferQueryLikeInput,
  QueryLike,
} from "@trpc/react-query/shared";
import type { Draft } from "immer";
import type { DatatableDataProps } from "node_modules/@repo/ui/src/components/display/datatable/datatable.component";
import { useEffect } from "react";
import { useImmer } from "use-immer";

interface QueryProviderProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQuery extends QueryLike<any, any>,
  TInput extends InferQueryLikeInput<TQuery> = InferQueryLikeInput<TQuery>,
  TOutput extends InferQueryLikeData<TQuery> = InferQueryLikeData<TQuery>,
> {
  endpoint: TQuery;
  defaultInput: TInput;
  input?: TInput;
  children: (query: {
    data: TOutput | undefined;
    isLoading: boolean;
    input: TInput;
    setInput: (input: Draft<TInput> | ((draft: Draft<TInput>) => void)) => void;
  }) => React.ReactNode;
}
export const QueryProvider = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQuery extends QueryLike<any, any>,
  TInput extends InferQueryLikeInput<TQuery> = InferQueryLikeInput<TQuery>,
  TOutput extends InferQueryLikeData<TQuery> = InferQueryLikeData<TQuery>,
>({
  endpoint,
  defaultInput,
  input: controlledInput,
  children,
}: QueryProviderProps<TQuery, TInput, TOutput>) => {
  const [input, setInput] = useImmer<TInput>({
    ...defaultInput,
    ...controlledInput,
  });

  const [latestData, setLatestData] = useImmer<TOutput | undefined>(undefined);

  useEffect(() => {
    if (controlledInput) {
      setInput((current) => ({
        ...current,
        ...controlledInput,
      }));
    }
  }, [controlledInput, setInput]);

  const { data, isLoading } = endpoint.useQuery(input) as {
    data: TOutput | undefined;
    isLoading: boolean;
  };

  useEffect(() => {
    if (data !== undefined) {
      setLatestData(data);
    }
  }, [data, setLatestData]);

  return <>{children({ data: latestData, isLoading, setInput, input })}</>;
};

interface DatatableSort<TData> {
  field: keyof TData & string;
  order: "asc" | "desc";
}

interface DatatableInput<TData> {
  search?: {
    query: string;
    fields?: (keyof TData & string)[];
  };
  sort?: DatatableSort<TData>[];
  pagination?: {
    page: number;
    size: number;
  };
}

interface DatatableOutput<TData> {
  rows: TData[];
  pagination: { page: number; size: number; total: number };
}

interface DatatableQueryProviderProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQuery extends QueryLike<any, any>,
  TData = InferQueryLikeData<TQuery>["rows"][number] extends DatatableOutput<
    infer T
  >
    ? T
    : unknown,
  TInput extends InferQueryLikeInput<TQuery> &
    DatatableInput<TData> = InferQueryLikeInput<TQuery> & DatatableInput<TData>,
  TOutput extends InferQueryLikeData<TQuery> &
    DatatableOutput<TData> = InferQueryLikeData<TQuery> &
    DatatableOutput<TData>,
> {
  endpoint: TQuery;
  defaultInput: TInput;
  input?: TInput;
  children: (
    props: DatatableDataProps<TOutput["rows"][number]>,
  ) => React.ReactNode;
}

export const DatatableQueryProvider = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TQuery extends QueryLike<any, any>,
  TData = InferQueryLikeData<TQuery>["rows"][number],
  TInput extends DatatableInput<TData> &
    InferQueryLikeInput<TQuery> = DatatableInput<TData> &
    InferQueryLikeInput<TQuery>,
  TOutput extends DatatableOutput<TData> &
    InferQueryLikeData<TQuery> = DatatableOutput<TData> &
    InferQueryLikeData<TQuery>,
>({
  endpoint,
  defaultInput,
  input: controlledInput,
  children,
}: DatatableQueryProviderProps<TQuery, TData, TInput, TOutput>) => {
  return (
    <QueryProvider<TQuery, TInput, TOutput>
      endpoint={endpoint}
      defaultInput={defaultInput}
      input={controlledInput}
    >
      {({
        data,
        isLoading,
        setInput,
        input,
      }: {
        data: DatatableOutput<TData> | undefined;
        isLoading: boolean;
        setInput: (
          input: Draft<TInput> | ((draft: Draft<TInput>) => void),
        ) => void;
        input: DatatableInput<TData>;
      }) =>
        children({
          data: data?.rows,
          isLoading,
          sortValue: input.sort?.map((sort) => ({
            key: sort.field,
            direction: sort.order,
          })),
          paginationValue: data?.pagination,
          searchValue: input.search,
          onSortChange: (...sort) => {
            setInput((draft) => ({
              ...draft,
              sort: sort.map((sort) => ({
                field: sort.key,
                order: sort.direction,
              })),
            }));
          },
          onPaginationChange: (pagination) =>
            setInput((draft) => ({
              ...draft,
              pagination,
            })),
          onSearchChange: (search) =>
            setInput((draft) => ({ ...draft, search })),
        })
      }
    </QueryProvider>
  );
};
