import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

class Streamscreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      connectedDevice: null,
      isStreaming: false,
      filePath: null,
      lastData: '',
    };
  }

  async componentDidMount() {
    await this.loadConnectedDevice();
  }

  componentWillUnmount() {
    if (this.dataListener) {
      this.dataListener.remove();
    }
  }

  // 🔹 Load connected device from storage
  loadConnectedDevice = async () => {
    try {
      const storedDevice = await AsyncStorage.getItem('device_connect');

      if (!storedDevice) return;

      const parsed = JSON.parse(storedDevice);
      const bonded = await RNBluetoothClassic.getBondedDevices();

      const device = bonded.find(d => d.id === parsed.id);

      if (device) {
        const isConnected = await device.isConnected();

        if (isConnected) {
          this.setState({ connectedDevice: device });

          // 🔹 Listen for incoming data
          this.dataListener = device.onDataReceived((event) => {
            this.handleIncomingData(event.data);
          });
        }
      }

    } catch (error) {
      console.log("Load device error:", error);
    }
  };

  // 🔹 START STREAM
  startStreaming = async () => {
    const { connectedDevice } = this.state;

    if (!connectedDevice) {
      Alert.alert("No device connected");
      return;
    }

    try {
      const timestamp = new Date().getTime();
      const path = `${RNFS.DownloadDirectoryPath}/LWD_${timestamp}.csv`;

      // Create CSV with header
      await RNFS.writeFile(path, "pulse,press\n", "utf8");

      this.setState({
        isStreaming: true,
        filePath: path
      });

      await connectedDevice.write("START\n");

      console.log("Streaming started");

    } catch (error) {
      console.log("Start error:", error);
      Alert.alert("Error", "Failed to start streaming");
    }
  };

  // 🔹 STOP STREAM MANUAL
  stopStreaming = async () => {
    const { connectedDevice } = this.state;

    if (!connectedDevice) return;

    try {
      await connectedDevice.write("STOP\n");
      this.setState({ isStreaming: false });
    } catch (error) {
      console.log("Stop error:", error);
    }
  };

  // 🔹 Handle Incoming Data
  handleIncomingData = async (data) => {

    if (!this.state.isStreaming) return;

    const cleanData = data.trim();

    // If ESP sends END
    if (cleanData === "END") {
      this.setState({ isStreaming: false });
      Alert.alert("Streaming Finished",
        "File saved:\n" + this.state.filePath
      );
      return;
    }

    try {
      // Save to CSV
      await RNFS.appendFile(
        this.state.filePath,
        cleanData + "\n",
        "utf8"
      );

      this.setState({ lastData: cleanData });

    } catch (error) {
      console.log("Append error:", error);
    }
  };

  render() {

    const { connectedDevice, isStreaming, lastData } = this.state;

    return (
      <SafeAreaView style={styles.container}>

        <Text style={styles.title}>Stream Data</Text>

        {/* Bluetooth Indicator */}
        <View style={[
          styles.statusBox,
          { backgroundColor: connectedDevice ? '#27C93F' : '#FF3B30' }
        ]}>
          <Text style={styles.statusText}>
            {connectedDevice ? "Bluetooth Connected" : "Not Connected"}
          </Text>
        </View>

        {/* Last Data Preview */}
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>
            {lastData || "Waiting data..."}
          </Text>
        </View>

        {/* START BUTTON */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={this.startStreaming}
          disabled={isStreaming}
        >
          <Text style={styles.buttonText}>START</Text>
        </TouchableOpacity>

        {/* STOP BUTTON */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={this.stopStreaming}
        >
          <Text style={styles.buttonText}>STOP</Text>
        </TouchableOpacity>

      </SafeAreaView>
    );
  }
}

export default Streamscreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },

  statusBox: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    marginBottom: 20
  },

  statusText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  dataBox: {
    height: 100,
    borderRadius: 5,
    backgroundColor: '#4541E4',
    justifyContent: 'center',
    marginBottom: 30
  },

  dataText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18
  },

  startButton: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    marginBottom: 20
  },

  stopButton: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    justifyContent: 'center'
  },

  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }

});
