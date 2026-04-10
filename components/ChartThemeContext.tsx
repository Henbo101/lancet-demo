'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ChartTheme {
  dark: boolean;
}

const ChartThemeContext = createContext<ChartTheme>({ dark: false });

export function ChartThemeProvider({
  dark,
  children,
}: {
  dark: boolean;
  children: ReactNode;
}) {
  return (
    <ChartThemeContext.Provider value={{ dark }}>
      {children}
    </ChartThemeContext.Provider>
  );
}

export function useChartTheme(): ChartTheme {
  return useContext(ChartThemeContext);
}
