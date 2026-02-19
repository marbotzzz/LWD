import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  Homescreen,
  Splashscreen,
  Historyscreen,
  Imagescreen,
  Summaryscreen,
  Bluetoothscreen,
  Projectscreen,
  Connectedscreen,
  Project1screen,
  Createprojectscreen,
  Projectinfoscreen,
  Sessionscreen,
  Sessioninfoscreen,
  Locationinfoscreen,
  Createlocationscreen,
  Streamscreen
} from '../pages';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomNavigator, HeaderModel} from '../components/molecules';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create individual stacks for each tab to manage their navigation
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Homescreen"
        component={Homescreen}
        options={{headerShown: false}}
      />
      {/* bisa ditambah halaman lagi yg ingin bottom tab nya mode Home
      misal:
      <Stack.Screen
        name=">nama page<"
        component={>nama page<}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
};

const ImageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Imagescreen"
        component={Imagescreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const SummaryStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Summaryscreen"
        component={Summaryscreen}
        options={{headerShown: false}}
      />

    </Stack.Navigator>
  );
};

const MainApp = () => {
  return (
    <Tab.Navigator tabBar={props => <BottomNavigator {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Image"
        component={ImageStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Settings"
        component={SummaryStack}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};

const Router = () => {
  return (
    <Stack.Navigator initialRouteName="Splashscreen">
      <Stack.Screen
        name="Splashscreen"
        component={Splashscreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MainApp"
        component={MainApp}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Connectedscreen"
        component={Connectedscreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Project1screen"
        component={Project1screen}
        options={({navigation}) => HeaderModel(navigation, 'Project')}
        // bisa pake cara >>> options={({ navigation }) => HeaderModel(navigation, 'Session Info')}
        // bisa pake cara >>> options={(props) => HeaderModel(props.navigation, 'Session Info')}
      />
      <Stack.Screen
        name="Createprojectscreen"
        component={Createprojectscreen}
        options={({navigation}) => HeaderModel(navigation, 'Create Project')}
      />
      <Stack.Screen
        name="Projectinfoscreen"
        component={Projectinfoscreen}
        options={({navigation}) => HeaderModel(navigation, 'Project Info')}
      />
      <Stack.Screen
        name="Sessionscreen"
        component={Sessionscreen}
        options={({navigation}) => HeaderModel(navigation, 'Create Session')}
      />
      <Stack.Screen
        name="Sessioninfoscreen"
        component={Sessioninfoscreen}
        options={({navigation}) => HeaderModel(navigation, 'Session Info')}
      />
      <Stack.Screen
        name="Projectscreen"
        component={Projectscreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Locationinfoscreen"
        component={Locationinfoscreen}
        options={({navigation}) => HeaderModel(navigation, 'Location Info')}
      />
      <Stack.Screen
        name="Createlocationscreen"
        component={Createlocationscreen}
        options={({navigation}) => HeaderModel(navigation, 'Create Location')}
      />
      <Stack.Screen
        name="Summaryscreen"
        component={Summaryscreen}
        options={{headerShown: false}}
      />

            <Stack.Screen
        name="Streamscreen"
        component={Streamscreen}
      />

    </Stack.Navigator>
  );
};

export default Router;
