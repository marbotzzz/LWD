import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, PermissionsAndroid, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { logo } from '../../assets/image';
import { location, database, folder, file, bluetooth } from '../../assets/icon';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import BluetoothSerial from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';

class Homescreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            permission: '',
            onBluetooth: false,
            apiLevelInfo: '',
            projects: [],
            sessions: [],
            locations: [],
            currentDate: '',
            defaultSettings: {
                targetE: '0',
                emoduliValue: '0',
                correctEmoduliValue: '0',
                targetE1: '0',
                targetE2: '0',
                topLayerThickness: '0',
                targetD1: '0',
                deflectionValue: '0',
                targetPressure: '0',
                deltaDeflectionValue: '0',
                force: '0',
                press: '0',
                pulse: '0',
                diameter: '0',
                poissonRatio : '0',
                roffset : '0',
            },
        };
    }

    componentDidMount() {
        this.checkBluetoothState();
        this.requestPermissions(async (granted) => {
          if (granted) {
              this.setState({ permission: 'true' });
              console.log('Bluetooth permission:', this.state.permission);
          } else {
              this.setState({ permission: 'false' });
              console.log('Bluetooth permission:', this.state.permission);
          }
        });

        // Set interval to update current date
        this.dateInterval = setInterval(() => {
            const currentDate = new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).replace(/-/g, '/'); // Replace hyphens with slashes
            this.setState({ currentDate });
        }, 1000); // Updates every second

        this.loadSettingsFromStorage();

        // Memuat data dari AsyncStorage
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.loadProjectsFromStorage();
            this.loadSessionsFromStorage();
            this.loadLocationsFromStorage();
        });
    }

    componentWillUnmount() {
        if (this.focusListener) {
            this.focusListener();
        }
    }

    loadSettingsFromStorage = async () => {
        const { defaultSettings } = this.state;
        try {
            const savedSettings = await AsyncStorage.getItem('settings');
            if (savedSettings) {
                console.log('Settings loaded successfully:', JSON.parse(savedSettings));
            } else {
                // If no settings found, initialize with default settings
                await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
                console.log('----------- No settings found, initialized with default values');
            }
        } catch (error) {
            console.error('Failed to load settings from storage', error);
        }
    };

    loadProjectsFromStorage = async () => {
        try {
            const storedProjects = await AsyncStorage.getItem('projects');
            if (storedProjects) {
                this.setState({ projects: JSON.parse(storedProjects) });
                console.log('Projects loaded successfully:', JSON.parse(storedProjects)); // Log saat data berhasil dimuat
            } else {
                console.log('No projects found in storage.');
            }
        } catch (error) {
            console.error('Failed to load projects from storage', error);
        }
    };

    loadSessionsFromStorage = async () => {
        try {
            const storedSessions = await AsyncStorage.getItem('sessions');
            if (storedSessions) {
                const parsedSessions = JSON.parse(storedSessions);
                this.setState({ sessions: parsedSessions });
                console.log('Sessions loaded successfully:', parsedSessions); // Log saat data berhasil difilter dan dimuat
            } else {
                console.log('No sessions found for this project.');
            }
        } catch (error) {
            console.error('Failed to load sessions from storage', error);
        }
    };

    loadLocationsFromStorage = async () => {
        try {
            const storedLocations = await AsyncStorage.getItem('locations');
            if (storedLocations) {
                const parsedLocations = JSON.parse(storedLocations);
                this.setState({ locations: parsedLocations });
                console.log('Locations loaded successfully:', parsedLocations); // Log saat data berhasil difilter dan dimuat
            } else {
                console.log('No locations found for this project.');
            }
        } catch (error) {
            console.error('Failed to load locations from storage', error);
        }
    };
    
    checkBluetoothState = async () => {
        try {
          const bluetoothState = await BluetoothSerial.isBluetoothEnabled();
          console.log('Bluetooth state:', bluetoothState);
          if (bluetoothState) {
            this.setState({ onBluetooth: true });
          } else {
            this.setState({ onBluetooth: false });
          }
        } catch (error) {
          console.error('Error checking Bluetooth state:', error);
        }
    };
    
    requestPermissions = async (cb) => {
        if (Platform.OS === 'android') {
          const apiLevel = await DeviceInfo.getApiLevel();
    
          if (apiLevel < 31) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Location Permission',
                message: 'Bluetooth requires Location',
                buttonNeutral: 'Ask Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            cb(granted === PermissionsAndroid.RESULTS.GRANTED);
            console.log('granted:', granted);
            console.log('Versi Android dibawah Android 12');
            this.setState({ apiLevelInfo: '1' });
          } else {
            const result = await requestMultiple([
                PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
              ]);
      
              const isGranted =
                result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
      
              cb(isGranted);
              console.log('granted multiple:', isGranted);
            console.log('Versi Android diatas Android 11');
            this.setState({ apiLevelInfo: '2' });
          }
        } else {
          cb(true);
        }
    };
    
    handleDeviceClick = async () => {
        const { permission } = this.state;
        try {
          if (permission == 'true') {
            await this.checkBluetoothState();
        
            if (this.state.onBluetooth) {
              const code = "1";
              this.props.navigation.navigate('Connectedscreen',{code});
            } else {
              if (this.state.apiLevelInfo == '1') {
                Alert.alert('Alert', 'Enable Bluetooth and Location Mode.');
              } else {
                Alert.alert('Alert', 'Enable Bluetooth Mode.');
              }
            }
          } else if (permission == 'false') {
            if (this.state.apiLevelInfo == '1') {
              Alert.alert('Alert', 'Make Sure Bluetooth Permission is Accepted.');
            } else {
              Alert.alert('Alert', 'Make Sure Bluetooth and Location Permissions Are Accepted.');
            }
          }
        } catch (error) {
          console.error("Error checking Bluetooth state:", error);
        }
    };

    handleProjectClick = async () => {
        const { permission } = this.state;
        try {
          if (permission == 'true') {
            this.props.navigation.navigate('Project1screen');
          } else if (permission == 'false') {
            if (this.state.apiLevelInfo == '1') {
              Alert.alert('Alert', 'Make Sure Bluetooth Permission is Accepted.');
            } else {
              Alert.alert('Alert', 'Make Sure Bluetooth and Location Permissions Are Accepted.');
            }
          }
        } catch (error) {
          console.error("Error checking Bluetooth state:", error);
        }
    };

    handleStreamClick = async () => {
    const { permission } = this.state;

    try {
        if (permission == 'true') {
            this.props.navigation.navigate('Streamscreen');
        } else if (permission == 'false') {
            if (this.state.apiLevelInfo == '1') {
                Alert.alert('Alert', 'Make Sure Bluetooth Permission is Accepted.');
            } else {
                Alert.alert('Alert', 'Make Sure Bluetooth and Location Permissions Are Accepted.');
            }
        }
    } catch (error) {
        console.error("Error checking Bluetooth state:", error);
    }
};


    render() {
        const { projects, sessions, locations, currentDate } = this.state;
        return (
            <View style={{ backgroundColor: "white", flex: 1 }}>
                <View>
                    <Text style={styles.judul}>Welcome to LWD Apps!</Text>
                </View>
                <View style={styles.box}>
                    <Image source={logo} style={styles.logo} />
                    <Text style={styles.text1}>LWD PROJECT</Text>
                    <Text style={styles.text2}>{currentDate}</Text>

                    <View style={styles.iconsContainer}>
                        {/* Menampilkan jumlah data di samping ikon */}
                        <View style={styles.iconWrapper}>
                            <Image source={folder} style={styles.icon} />
                            <Text style={styles.iconText}>{projects?.length || 0}</Text>
                        </View>
                        <View style={styles.iconWrapper}>
                            <Image source={file} style={styles.icon2} />
                            <Text style={styles.iconText}>{sessions?.length || 0}</Text>
                        </View>
                        <View style={styles.iconWrapper}>
                            <Image source={location} style={styles.icon} />
                            <Text style={styles.iconText}>{locations?.length || 0}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.box2} onPress={this.handleProjectClick}>
                        <Image source={database} style={styles.iconproj} />
                        <Text style={styles.text4}>Project</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.box1} onPress={this.handleDeviceClick}>
                        <Image source={bluetooth} style={styles.iconblue} />
                        <Text style={styles.text3}>Device</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.box2} onPress={this.handleStreamClick}>
                        <Image source={database} style={styles.iconproj} />
                        <Text style={styles.text4}>Stream</Text>
                    </TouchableOpacity>

                    <View style={{ width: 170 }} /> 
                </View>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    judul: {
        color: '#000000',
        fontSize: 24,
        marginLeft: 16,
        marginTop: 30,
    },
    box: {
        marginHorizontal: 16,
        height: 160,
        backgroundColor: '#FFCC00',
        marginTop: 20,
        borderRadius: 5,
    },
    text1: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginLeft: 20,
    },
    text2: {
        color: "#000000",
        marginTop: 5,
        marginLeft: 20,
        fontSize: 14
    },
    logo: {
        width: 120,
        height: 120,
        position: 'absolute',
        right: 15,
        bottom: 20,
        top: 20,
        resizeMode: 'contain',
        borderRadius: 5,
    },
    iconsContainer: {
        marginTop: 40,
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    iconproj: {
      width : 65,
      height : 65,
      marginTop: 15,
      alignSelf: 'center',
    },
    iconblue: {
      width : 33,
      height : 53,
      marginTop: 20,
      alignSelf: 'center',
    },
    iconWrapper: {
        flexDirection: 'row',
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    icon2: {
        width: 26,
        height: 26,
        marginTop: 2,
        resizeMode: 'contain',
    },
    iconText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 5,
        marginRight: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        marginHorizontal: 16,
    },
    box1: {
        height: 135,
        width: 170,
        backgroundColor: '#4541E4',
        borderRadius: 5,
    },
    text3: {
        fontSize: 20,
        color: "#FFFFFF",
        alignSelf: 'center',
        position: 'absolute',
        bottom: 20,
        fontWeight: 'bold',
    },
    box2: {
        height: 135,
        width: 170,
        backgroundColor: '#4541E4',
        borderRadius: 5,
    },
    text4: {
        fontSize: 20,
        color: "#FFFFFF",
        alignSelf: 'center',
        position: 'absolute',
        bottom: 20,
        fontWeight: 'bold',
    },
    box3: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
},

});

export default function (props) {
    const navigation = useNavigation();
    const route = useRoute();
    return <Homescreen {...props} navigation={navigation} route={route} />;
}
