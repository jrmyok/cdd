interface InnerWrapperProps {
  children?: React.ReactNode;
  maxWidth?: string;
}

export const InnerWrapper: React.FC<InnerWrapperProps> = ({ children, maxWidth }) => {
  const widthClass = maxWidth ? maxWidth : 'max-w-screen-xl';

  return <div className={`flex ${widthClass} pt-4 pb-4 sm:pt-6 sm:pb-12 justify-between`}>{children}</div>;
};
