// DataStateContainer.tsx
type DataStateContainerProps = {
  isLoading: boolean;
  isError: boolean;
  data: unknown;
  errorComponent: React.ReactNode;
  loadingComponent: React.ReactNode;
  emptyComponent: React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
};

export const DataStateContainer = ({
  isLoading,
  isError,
  data,
  errorComponent,
  loadingComponent,
  emptyComponent,
  children,
  // containerClassName = "bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll",
  containerClassName = "w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll",
}: DataStateContainerProps) => {
  if (isError) return <>{errorComponent}</>;

  return (
    <div className={containerClassName}>
      {isLoading ? loadingComponent : !data ? emptyComponent : children}
    </div>
  );
};
