interface InnerWrapperProps {
  children?: React.ReactNode;
  maxWidth?: string;
}

export const InnerWrapper: React.FC<InnerWrapperProps> = ({
  children,
  maxWidth,
}) => {
  const widthClass = maxWidth ? maxWidth : "max-w-screen-xl";

  return (
    <div className={`flex ${widthClass} justify-between `}>{children}</div>
  );
};
