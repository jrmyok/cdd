export const MaxWidthWrapper = (
  props: React.PropsWithChildren<NonNullable<unknown>>
) => {
  return (
    <div
      className={"relative mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8"}
    >
      {props.children}
    </div>
  );
};

export default MaxWidthWrapper;
