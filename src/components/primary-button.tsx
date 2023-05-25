import { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { isLink?: never; href?: never };
type LinkProps = { isLink: boolean; href: string } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export default function PrimaryButton({ children, isLink, ...props }: ButtonProps | LinkProps) {
  if (isLink) {
    const { href } = props as LinkProps;
    if (!href) throw new Error('href is required for link button');
    return (
      <Link
        href={href}
        className="bg-white text-sm px-4 font-medium hover:bg-gray-50 transition duration-15 ease-in-out rounded-md py-2"
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      className="bg-white text-sm px-4 font-medium hover:bg-gray-50 transition duration-15 ease-in-out rounded-md py-2"
      {...props}
    >
      {children}
    </button>
  );
}
