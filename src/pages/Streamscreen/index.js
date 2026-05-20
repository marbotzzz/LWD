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
import Svg, { Path,
              Line,
              Text as SvgText
 } from 'react-native-svg';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

class Streamscreen extends Component {

  constructor(props) {
    super(props);
    // Graph scroll reference
    this.graphScrollRef = React.createRef();
    this.state = {
      connectedDevice: null,
      isStreaming: false,
      filePath: null,
      lastData: '',
      graphData: [],

      expectedSamples: 0,
      receivedSamples: 0,
      isReceivingFrame: false,
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

      this.setState({
        isStreaming: true,
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
    const cleanData = data.trim();
    if (cleanData.startsWith("FRAME_START")) {

      const parts = cleanData.split(",");

      const count = parseInt(parts[1]);

      this.setState({
        expectedSamples: count,
        receivedSamples: 0,
        isReceivingFrame: true,
        graphData: [],
        streamBuffer: [],
      });

      console.log("Frame started:", count);

      return;
    }

    if (!this.state.isStreaming) return;

    // If ESP sends FRAME_END
    if (cleanData === "FRAME_END") {

      this.setState({
        isStreaming: false,
        isReceivingFrame: false,
      });

      const {
        expectedSamples,
        receivedSamples
      } = this.state;

      // Validation
      if (receivedSamples !== expectedSamples) {

        Alert.alert(
          "Frame Error",
          `Expected ${expectedSamples} samples\nReceived ${receivedSamples}`
        );

        return;
      }

      // Save dialog
      Alert.alert(
        "Streaming Finished",
        `Received ${receivedSamples} samples\nSave measurement data?`,
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: this.saveCSV
          }
        ]
      );

      return;
    }

    try {
      // Save to CSV

      const parts = cleanData.split(",");

      if (parts.length >= 2) {

        const signal = parseFloat(parts[1]);

        if (!isNaN(signal)) {

          this.setState((prevState) => {

            const updatedGraph = [
              ...prevState.graphData,
              signal
            ];

            return {

              lastData: cleanData,

              graphData: updatedGraph,

              streamBuffer: [
                ...prevState.streamBuffer,
                cleanData
              ],

              receivedSamples:
                prevState.receivedSamples + 1
            };
          });

          if (this.state.isStreaming) {

            setTimeout(() => {

              this.graphScrollRef.current?.scrollToEnd({
                animated: true
              });

            }, 10);
          }
        }
      }

    } catch (error) {
      console.log("Data error:", error);
    }
  };
  saveCSV = async () => {

    try {

      const timestamp = new Date().getTime();

      const path =
        `${RNFS.DownloadDirectoryPath}/LWD_${timestamp}.csv`;

      const {
        streamBuffer,
        receivedSamples
      } = this.state;

      // HEADER
      let csvContent =
        "time_ms,signal\n";

      // DATA
      csvContent +=
        streamBuffer.join("\n");

      // SAVE FILE
      await RNFS.writeFile(
        path,
        csvContent,
        "utf8"
      );

      Alert.alert(
        "CSV Saved",
        `Saved ${receivedSamples} samples\n\n${path}`
      );

    } catch (error) {

      console.log(
        "Save CSV error:",
        error
      );

      Alert.alert(
        "Save Error",
        "Failed to save CSV"
      );
    }
  };
  
  generatePath = () => {

    const { graphData } = this.state;

    if (graphData.length < 2) {
      return '';
    }

    const width = Math.max(
      graphData.length * 5,
      300
    );

    const height = 200;

    const maxValue = 1.5;
    const minValue = -1.5;

    const stepX = 5;

    let path = '';

    graphData.forEach((value, index) => {

      const x = index * stepX;

      const y =
        height -
        (
          (value - minValue) /
          (maxValue - minValue)
        ) * height;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
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

        {/* GRAPH */}
       <View style={styles.graphContainer}>

          <ScrollView
            horizontal
            ref={this.graphScrollRef}
          >

            <Svg
              height="230"
              width={Math.max(
                this.state.graphData.length * 5,
                300
              )}
            >

              {/* Center line */}
              <Line
                x1="0"
                y1="100"
                x2={Math.max(
                  this.state.graphData.length * 5,
                  300
                )}
                y2="100"
                stroke="#555"
                strokeWidth="1"
              />

              {/* Left axis */}
              <Line
                x1="0"
                y1="0"
                x2="0"
                y2="200"
                stroke="#555"
                strokeWidth="1"
              />

              {/* Labels */}
              <SvgText
                x="5"
                y="15"
                fill="white"
                fontSize="10"
              >
                1.5
              </SvgText>

              <SvgText
                x="5"
                y="105"
                fill="white"
                fontSize="10"
              >
                0
              </SvgText>

              <SvgText
                x="5"
                y="195"
                fill="white"
                fontSize="10"
              >
                -1.5
              </SvgText>

              {/* Waveform */}
              <Path
                d={this.generatePath()}
                stroke="#00FF88"
                strokeWidth="2"
                fill="none"
              />

            </Svg>

          </ScrollView>

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
  },

    graphContainer: {
    height: 250,
    backgroundColor: '#111',
    borderRadius: 5,
    padding: 10,
    marginBottom: 30,
  },

});
