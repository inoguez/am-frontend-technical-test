import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

import type { AppDispatch, RootState } from '@/store';
/**
 * Hooks tipados
 *
 * para usar siempre estos en lugar de useDispatch/useSelector directos.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
