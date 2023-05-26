import { useEffect, useState } from "react";

export const Section = (
  props: React.PropsWithChildren<NonNullable<unknown>>
) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  const isMdAndLarger = isClient ? window.innerWidth >= 768 : false;

  return (
    <div
      style={{
        minHeight: isMdAndLarger ? "calc(100vh - 150px)" : "calc(100vh - 50px)",
      }}
      className="m-auto flex flex-col justify-start"
    >
      {props.children}
    </div>
  );
};

export default Section;
