import "react-native-gesture-handler";
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Splashscreen,Homescreen,Historyscreen,Imagescreen,Summaryscreen,Bluetoothscreen,Connectedscreen,Projectscreen,Createprojectscreen,Sessionscreen,Sessioninfoscreen,Locationinfoscreen,Createlocationscreen, Streamscreen} from './pages';
import Router from './router';



const App = () => {
  return (
    <NavigationContainer>
      <Router/>
    </NavigationContainer>
  );
};



export default App;