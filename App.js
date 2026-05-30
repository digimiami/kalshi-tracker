import React from 'react';
import { StatusBar } from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';

const COLORS = {
  bg: '#0a0e27',
};

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <DashboardScreen />
    </>
  );
}
