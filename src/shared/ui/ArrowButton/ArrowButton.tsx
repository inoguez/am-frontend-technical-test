import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

import styles from './ArrowButton.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'left' | 'right' | 'up' | 'down';
}
export const ArrowButton = ({ variant, className, ...props }: Props) => {
  return (
    <button
      type='button'
      className={clsx(styles.arrowContainer, className)}
      {...props}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='11'
        height='17'
        viewBox='0 0 11 17'
        fill='none'
        className={clsx(styles[variant])}
      >
        <path
          d='M3.77067 8.48535L10.3707 15.0854L8.48533 16.9707L-9.53674e-07 8.48535L8.48533 1.90735e-05L10.3707 1.88668L3.77067 8.48535Z'
          fill='white'
        />
      </svg>
    </button>
  );
};
