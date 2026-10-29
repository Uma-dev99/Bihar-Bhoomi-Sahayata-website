import { createContext, useContext } from 'react';
import { DEFAULT_LANGUAGE } from '../config/languages';

export const LangContext = createContext(DEFAULT_LANGUAGE);

/** Current page language: 'hi' or 'en'. */
export function useLang() {
  return useContext(LangContext);
}
