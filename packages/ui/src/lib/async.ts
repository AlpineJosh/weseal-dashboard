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
