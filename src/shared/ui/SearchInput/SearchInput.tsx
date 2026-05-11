import type { InputHTMLAttributes } from 'react';

import styles from './SearchInput.module.css';

type Input = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;
interface Props extends Input {
  onChange: (value: string) => void;
}
export const SearchInput = ({ ...props }: Props) => {
  return (
    <div className={styles.inputContainer}>
      <svg
        className={styles.searchIcon}
        xmlns='http://www.w3.org/2000/svg'
        width='18'
        height='18'
        viewBox='0 0 18 18'
        fill='none'
      >
        <path
          d='M12.5 11H11.71L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 13C8.11 13 9.59 12.41 10.73 11.43L11 11.71V12.5L16 17.49L17.49 16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z'
          fill='var(--accent)'
        />
      </svg>
      <input
        {...props}
        type='text'
        className={styles.input}
        onChange={(event) => props.onChange(event.target.value)}
      />
      <svg
        className={styles.peopleIcon}
        width='14'
        height='14'
        viewBox='0 0 14 14'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fill-rule='evenodd'
          clip-rule='evenodd'
          d='M10.4039 2.69131C10.9617 4.30221 10.4372 6.08958 9.09741 7.14366C11.3891 8.05315 12.9917 10.1532 13.2641 12.6037C13.3031 12.9677 13.0412 13.2951 12.6774 13.337H12.6041C12.2627 13.3391 11.975 13.083 11.9374 12.7437C11.6343 10.0455 9.35256 8.00568 6.63741 8.00568C3.92227 8.00568 1.6405 10.0455 1.33741 12.7437C1.29691 13.1119 0.965603 13.3775 0.597413 13.337C0.229223 13.2965 -0.0364214 12.9652 0.00407945 12.597C0.275157 10.1537 1.86881 8.05789 4.15075 7.14366C2.81098 6.08958 2.28648 4.30221 2.84422 2.69131C3.40196 1.08041 4.91936 0 6.62408 0C8.3288 0 9.8462 1.08041 10.4039 2.69131ZM3.95741 4.00366C3.95741 5.47642 5.15132 6.67033 6.62408 6.67033C7.33132 6.67033 8.0096 6.38938 8.5097 5.88928C9.00979 5.38918 9.29075 4.71091 9.29075 4.00366C9.29075 2.5309 8.09684 1.337 6.62408 1.337C5.15132 1.337 3.95741 2.5309 3.95741 4.00366Z'
          fill='var(--accent)'
        />
      </svg>
    </div>
  );
};
