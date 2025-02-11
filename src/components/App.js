import React from 'react';
import { GlobalStyle, ThemeProvider } from '@react95/core';
import { createGlobalStyle } from 'styled-components';
import DataService from '../services/dataService';
import DataContext from '../contexts/dataContext';
import Desktop from './Desktop';

const dataService = new DataService();

const BodyFontSizeOverride = createGlobalStyle`
  body{
    font-size: 15px
  }
`;

const App = () => (
  <DataContext.Provider value={dataService}>
    <ThemeProvider>
      <GlobalStyle />
      <BodyFontSizeOverride />

      <Desktop />
    </ThemeProvider>
  </DataContext.Provider>
);
export default App;
