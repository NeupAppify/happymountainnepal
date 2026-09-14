'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { buttonVariants, type ButtonStyleProps } from '@neup/components/styles/button';
import { Link } from './link';

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href?: string;
  takesTo?: string;
  backsTo?: string;
  backs?: string;
  basePath?: boolean;
  children?: ReactNode;
  preIcon?: ReactNode;
  postIcon?: ReactNode;
} & ButtonStyleProps;

export function LinkButton({ className, variant = 'tinted', convey = 'none', size = 'default', alignment = 'center', preIcon, postIcon, children, ...props }: LinkButtonProps) {
  return <Link {...props} className={buttonVariants({ variant, convey, size, alignment, className })}>
    {preIcon}
    {children}
    {postIcon}
  </Link>;
}
