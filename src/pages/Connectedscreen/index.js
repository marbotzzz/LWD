import { useNavigation, useRoute } from '@react-navigation/native';
import React, { Component } from 'react';
import { arrowback } from '../../assets/icon';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Image, ScrollView, SafeAreaView, Alert, ActivityIndicator, BackHandler } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setConnectedDevice, clearConnectedDevice } from '../../utils/bluetoothManager';


const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "white",
    flex: 1,
  },
  backIcon: {
    width: 27,
    height: 20,
  },
  buttonback: {
    position: 'absolute',
    top: 28,
    left: 16,
  },
  judul: {
    marginTop: 22,
    marginBottom: 25,
    textAlign : 'center',
    fontSize : 20,
    color : '#000000',
  },
  boxx: {
    height: 45,
    borderRadius: 5,
    backgroundColor: '#FFCC00',
    marginBottom: 20,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  boxconnect: {
    marginHorizontal: 16,
    height: 45,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(39,201,63,1)',
    backgroundColor: 'rgba(39,201,63,0.2)',
    justifyContent: 'center',
    marginBottom: 30,
  },
  box3: {
    height: 45,
    borderRadius: 5,
    backgroundColor: 'red',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  text1: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Roboto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text2: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Roboto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text5: {
    fontSize: 18,
    color: "#000000",
    textAlign: 'left',
    marginBottom: 14,
    left: 16,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    zIndex: 1,
  },
  loadingContainer: {
    backgroundColor: '#FFCC00',
    padding: 20,
    borderRadius: 10,
  },
  centeredContainer: {
      flex: 1, // Membuat container memenuhi layar
      justifyContent: 'center', // Mengatur konten agar berada di tengah secara vertikal
      alignItems: 'center', // Mengatur konten agar berada di tengah secara horizontal
  },
  noBondText: {
      fontSize: 16,
      color: '#000',
      marginTop: -70,
  },
});

class Connectedscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      connectedDevice: null,
      isConnecting: false,
      code: props.route.params.code,
    };
    this.readInterval = null;
  }

  componentDidMount() {
    console.log('code = ', this.state.code);
    this.getBondedDevices();
    this.loadDeviceFromStorage();

    // Add BackHandler listener
    this.backAction = () => {
      if (this.state.isConnecting) {
        // Prevent the back action if connecting
        Alert.alert('Connecting', 'Please wait until the connection is established.');
        return true; // Returning true prevents the back action
      }
      return false; // Allow back action
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', this.backAction);
    this.removeBackHandler = () => backHandler.remove();
  }

  componentWillUnmount() {
    if (this.connectionChecker) {
      clearInterval(this.connectionChecker);
    }

    // Remove the back handler
    this.removeBackHandler();
  }

  getBondedDevices = async () => {
    console.log('Bluetoothscreen::getBondedDevices');
    const stillOnBluetooth = await RNBluetoothClassic.isBluetoothEnabled();
    try {
      if (stillOnBluetooth) {
          let bonded = await RNBluetoothClassic.getBondedDevices();
          console.log('Bluetoothscreen::getBondedDevices found', bonded);
          this.setState({ devices: bonded });
      } else {
          Alert.alert('Turn on the bluetooth mode');
      }
    } catch (error) {
      this.setState({ devices: [] });
      Alert.alert('Error', error.message);
    }
  };

  loadDeviceFromStorage = async () => {
    try {
      const stillOnBluetooth = await RNBluetoothClassic.isBluetoothEnabled();
      if (stillOnBluetooth) {
        const storedDevice = await AsyncStorage.getItem('device_connect');
        if (storedDevice) {
          const parsedDevice = JSON.parse(storedDevice);
          const bondedDevices = await RNBluetoothClassic.getBondedDevices();
    
          // Cari perangkat dari daftar bonded devices menggunakan ID atau address
          const connectedDevice = bondedDevices.find(d => d.id === parsedDevice.id);
    
          if (connectedDevice) {
            let isConnected = await connectedDevice.isConnected();
            if (!isConnected) {
              // Remove the connected device from AsyncStorage
              await AsyncStorage.removeItem('device_connect');
              console.log('Device removed from storage:', connectedDevice.name);
            
            } else {
              this.setState((prevState) => ({
                connectedDevice: connectedDevice,
                devices: prevState.devices.filter((d) => d.id !== connectedDevice.id),
              }));
              console.log('Connected device loaded:', connectedDevice);
  
              // pengecekan berkala device masih aktif atau tidak
              this.connectionChecker = setInterval(this.checkDeviceConnection, 2000);
            }
          } else {
            console.log('Device not found in bonded devices.');
            // Remove the connected device from AsyncStorage
            await AsyncStorage.removeItem('device_connect');
          }
        } else {
          console.log('No devices connected found in storage.');
        }
      } else {
          Alert.alert('Turn on the bluetooth mode');
      }
    } catch (error) {
      Alert.alert('Failed to load connected device from storage', error);
    }
  };
  

  connectToDevice = async (device) => {
    const { connectedDevice} = this.state;
    
    try {
      const stillOnBluetooth = await RNBluetoothClassic.isBluetoothEnabled();
      this.setState({ isConnecting: true });
      if (stillOnBluetooth) {
          if (connectedDevice) {
            await this.disconnectFromDevice();
            console.log('disconnect from :', connectedDevice.name);
          }
    
          let isConnected = await device.isConnected();
          if (!isConnected) {
            await device.connect({
              DELIMITER: "",
              READ_SIZE: 8192
            });
            setConnectedDevice(device); 
            this.setState((prevState) => ({
              connectedDevice: device,
              devices: prevState.devices.filter((d) => d.id !== device.id),
            }));
            console.log('connect from :', device);
    
            // Save connected device to AsyncStorage
            this.saveDeviceToStorage(device);
    
            // pengecekan berkala device masih aktif atau tidak
            this.connectionChecker = setInterval(this.checkDeviceConnection, 2000);
          
          } else {
            Alert.alert('Already Connected', `Already connected to ${device.name}`);
          }
      } else {
          Alert.alert("Turn on the bluetooth mode");
      }
      this.setState({ isConnecting: false });
    } catch (error) {
      Alert.alert('Error', `Failed to connect to ${device.name}`);
      this.setState({ isConnecting: false });
    }
  };

  saveDeviceToStorage = async (device) => {
    try {
      // Hanya menyimpan ID atau address dari perangkat
      const deviceData = { id: device.id, name: device.name, address: device.address };
      await AsyncStorage.setItem('device_connect', JSON.stringify(deviceData));
      console.log('Device saved to storage:', deviceData);
    } catch (error) {
      Alert.alert('Failed to save device to storage', error);
    }
  };

  checkDeviceConnection = async () => {
    const { connectedDevice } = this.state;
    if (connectedDevice) {
      try {
        const stillConnected = await connectedDevice.isConnected();
        console.log('Connection device status:', stillConnected);
        if (!stillConnected) {
          await this.functionCheckDevice(connectedDevice);
          Alert.alert(`Disconnected with ${connectedDevice.name}`, `Device ${connectedDevice.name} is inactive or out of range`);
        }
      } catch (error) {
        //console.error('Error while checking device connection:', error);
        // Tangani ketika Bluetooth mati tiba-tiba
        if (error.message.includes('Bluetooth mAdapter is not enabled')) {
          await this.functionCheckDevice(connectedDevice);
          Alert.alert(`Disconnected`, `Bluetooth has been turned off.`);
        }
      }
    }
  };

  functionCheckDevice = async (connectedDevice) => {
      clearInterval(this.connectionChecker);
      // Add the disconnected device back to the list of devices
      this.setState((prevState) => ({
        connectedDevice: null,
        devices: [...prevState.devices, connectedDevice],  // Add disconnected device back to the list
      }));

      // Remove the connected device from AsyncStorage
      await AsyncStorage.removeItem('device_connect');
      clearConnectedDevice();

      console.log('Device removed from storage:', connectedDevice.name);
  };

  disconnectFromDevice = async () => {
    const { connectedDevice, devices } = this.state;
    if (!connectedDevice) {
      Alert.alert('No Device', 'No device is currently connected.');
      return;
    }

    try {
      console.log('disconnect from :', connectedDevice);
      await connectedDevice.disconnect();
      clearConnectedDevice();
      
      // Add the disconnected device back to the list of devices
      this.setState((prevState) => ({
        connectedDevice: null,
        devices: [...prevState.devices, connectedDevice],  // Add disconnected device back to the list
      }));

      // Remove the connected device from AsyncStorage
      await AsyncStorage.removeItem('device_connect');
      console.log('Device removed from storage:', connectedDevice.name);

      if (this.connectionChecker) {
        clearInterval(this.connectionChecker);
      }

    } catch (error) {
      Alert.alert('Error', `Failed to disconnect from ${connectedDevice.name}`);
    }
  };

  sendMessage = async () => {
    const { connectedDevice, message } = this.state;
    if (!connectedDevice) {
      Alert.alert('Error', 'No device is connected.');
      return;
    }

    try {
      // Add newline to message to match ESP32 format
      const formattedMessage = `${message}\n`;
      console.log(`Attempting to send data: ${formattedMessage}`);
      await connectedDevice.write(formattedMessage);
      this.setState({ message: '' }); // Clear the input field after sending
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  handleIncomingData = (data) => {
    console.log('Data received:', data);
    this.setState({ receivedMessage: data });
    //Alert.alert('Message received', data);
  };

  Back = () => {
    const { code } = this.state;
    if (code == "1") {
      this.props.navigation.navigate('Homescreen');
    } else if (code == "2") {
      this.props.navigation.navigate('Projectscreen');
    }
  };

  

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
        <Text style={styles.judul}>Device</Text>
        <TouchableOpacity style={styles.buttonback} onPress={this.Back}>
          <Image source={arrowback} style={styles.backIcon} />
        </TouchableOpacity>

        {this.state.connectedDevice && (
          <>
            <Text style={styles.text5}>Connected Device</Text>
            <View style={styles.boxconnect}>
              <Text style={styles.text1}>
                Connected to {this.state.connectedDevice.name}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.text5}>Installed Device</Text>
        {this.state.devices.length > 0 ? (
          <ScrollView>
              {this.state.devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.boxx}
                  onPress={() => this.connectToDevice(device)}
                >
                  <Text style={styles.text1}>{device.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        ) : (
            <View style={styles.centeredContainer}>
                <Text style={styles.noBondText}>No Installed Device</Text>
            </View>
        )}
        {this.state.connectedDevice && (
          <TouchableOpacity style={styles.box3} onPress={this.disconnectFromDevice}>
            <Text style={styles.text2}>Disconnect from {this.state.connectedDevice.name}</Text>
          </TouchableOpacity>
        )}

        {this.state.isConnecting && (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4541E4" />
              <Text style={{color: '#4541E4', marginTop: 10, alignSelf: 'center'}}>Connecting...</Text>
            </View>
          </View>
        )}

      </SafeAreaView>
    );
  }
}

export default function(props) {
  const navigation = useNavigation();
  const route = useRoute();
  return <Connectedscreen {...props} navigation={navigation} route={route} />;
}
