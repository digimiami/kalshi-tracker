import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import DashboardScreen from './src/screens/DashboardScreen';

const COLORS = {
  bg: '#0a0e27',
  text: '#e8eaff',
};

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <DashboardScreen />
    </>
  );
}
