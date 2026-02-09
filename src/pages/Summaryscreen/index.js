import React, { useState, useEffect } from 'react';
import { arrowback, trash, check } from '../../assets/icon';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const SummaryScreen = () => {
    const defaultSettings = {
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
    };
    const navigation = useNavigation();
    const route = useRoute();
    const code = route.params?.code ?? 0;
    const [settings, setSettings] = useState(defaultSettings);
    const [isFinish, setisFinish] = useState(false);

    const forceValues = ["10", "20", "30", "40"];
    const pressValues = ["10", "20", "30", "40"];
    const pulseValues= ["10", "20", "30", "40"];
    const poissonRatioValues = ["0", "0.30", "0.35", "0.40"];
    const diameterValues = ["0", "150", "200", "300"];
    const roffsetValues = ["10", "20", "30", "40"];

    // Load settings from AsyncStorage when component mounts
    const loadSettingsFromStorage = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
                console.log('Settings loaded successfully:', JSON.parse(savedSettings));
            } else {
                // If no settings found, initialize with default settings
                await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
                setSettings(defaultSettings);
                console.log('No settings found, initialized with default values');
            }
        } catch (error) {
            console.error('Failed to load settings from storage', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadSettingsFromStorage();
        }, [])
    );

    // Save settings to AsyncStorage
    const saveSettingsToStorage = async () => {
        // Check if any setting value is empty
        const hasEmptyField = Object.values(settings).some(value => value === '');
    
        if (hasEmptyField) {
            // Show alert if any field is empty
            Alert.alert('Alert', 'All fields must be filled out before saving.');
            return; // Exit the function, do not save
        }
    
        try {
            await AsyncStorage.setItem('settings', JSON.stringify(settings));
            console.log('Settings saved successfully:', settings);

            // Set isFinish to true to show success message
            setisFinish(true);
            // Reset isFinish after 3 seconds
            setTimeout(() => {
                setisFinish(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to save settings to storage', error);
        }
    };

    // Handle text input changes
    const handleInputChange = (name, value) => {
        const newSettings = { ...settings, [name]: value };
        setSettings(newSettings);
    };

    const handlePickerChange = (name, value) => {
        const newSettings = { ...settings, [name]: value };
        setSettings(newSettings);
    };

    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <View>
                <Text style={styles.title}>Settings</Text>
            </View>
            {code === 1 && (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={arrowback} style={styles.backIcon} />
                </TouchableOpacity>
            )}
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.text1}>E-Modulli Settings</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Target E</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.targetE}
                            onChangeText={(value) => handleInputChange('targetE', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text3}>E-Modulli Value</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.emoduliValue}
                            onChangeText={(value) => handleInputChange('emoduliValue', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.line} />
                </View>
                
                <View style={styles.container}>
                    <Text style={styles.text1}>Correct E-Modulli Settings</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Correct E-Moduli Value</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.correctEmoduliValue}
                            onChangeText={(value) => handleInputChange('correctEmoduliValue', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text3}>Target E1</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.targetE1}
                            onChangeText={(value) => handleInputChange('targetE1', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text3}>Target E2</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.targetE2}
                            onChangeText={(value) => handleInputChange('targetE2', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text3}>Top Layer Thickness</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.topLayerThickness}
                            onChangeText={(value) => handleInputChange('topLayerThickness', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.line} />
                </View>
                
                <View style={styles.container}>
                    <Text style={styles.text1}>Deflection</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Target D1</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.targetD1}
                            onChangeText={(value) => handleInputChange('targetD1', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Deflection Value</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.deflectionValue}
                            onChangeText={(value) => handleInputChange('deflectionValue', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Target Pressure</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.targetPressure}
                            onChangeText={(value) => handleInputChange('targetPressure', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.line} />
                </View>
                
                <View style={styles.container}>
                    <Text style={styles.text1}>Delta Deflection Settings</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Delta Deflection Value</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter value"
                            value={settings.deltaDeflectionValue}
                            onChangeText={(value) => handleInputChange('deltaDeflectionValue', value)}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                    
                    <View style={styles.line} />
                </View>
                
                <View style={styles.container}>
                    <Text style={styles.text1}>Drops Settings</Text>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Force (kN)</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.force}
                                onValueChange={(value) => handlePickerChange('force', value)}
                                style={styles.picker}
                            >
                                {forceValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Press (kPa)</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.press}
                                onValueChange={(value) => handlePickerChange('press', value)}
                                style={styles.picker}
                            >
                                {pressValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    
                    <View style={styles.row}>
                        <Text style={styles.text2}>Pulse (ms)</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.pulse}
                                onValueChange={(value) => handlePickerChange('pulse', value)}
                                style={styles.picker}
                            >
                                {pulseValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.text2}>Poisson Ratio</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.poissonRatio}
                                onValueChange={(value) => handlePickerChange('poissonRatio', value)}
                                style={styles.picker}
                            >
                                {poissonRatioValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.text2}>Diameter (mm)</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.diameter}
                                onValueChange={(value) => handlePickerChange('diameter', value)}
                                style={styles.picker}
                            >
                                {diameterValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.text2}>R.Offset (cm)</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={settings.roffset}
                                onValueChange={(value) => handlePickerChange('roffset', value)}
                                style={styles.picker}
                            >
                                {roffsetValues.map((val, index) => (
                                    <Picker.Item key={index} label={val} value={val} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                </View>
                <TouchableOpacity style={styles.box3} onPress={saveSettingsToStorage}>
                    <Text style={styles.label6}>Save</Text>
                </TouchableOpacity>
            </ScrollView>

            {isFinish && (
                <View style={[StyleSheet.absoluteFill, styles.overlay]}>
                    <View style={styles.loadingContainer}>
                    <Image source={check} style={styles.checkIcon} />
                        <Text style={{color: '#4BD048', marginTop: 10, alignSelf: 'center', fontWeight: 'bold'}}>  Success  </Text>   
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 22,
        marginBottom: 10,
        color: "#000000"
    },
    backButton: {
        position: 'absolute',
        top: 28,
        left: 16,
    },
    backIcon: {
        width: 27,
        height: 20,
    },
    container: {
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    text1: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#000000",
    },
    text2: {
        fontSize: 14,
        color: "#000000",
    },
    text3: {
        fontSize: 14,
        color: "#000000",
    },
    box3: {
        height: 45,
        marginHorizontal: 16,
        backgroundColor: '#4541E4',
        borderRadius: 5,
        marginTop: 30,
        marginBottom: 40,
        justifyContent: 'center',
    },
    label6: {
        fontSize: 18,
        color: '#FFFFFF',
        alignSelf: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    input: {
        height: 40,
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 5,
        width: '40%',
        paddingHorizontal: 10,
        color: '#000000', // <-- added to make text black
    },
    picker: {
        width: 150,
        left: -10,
        color: '#000000',
        
    },
    pickerContainer: {
        height: 40,
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 5,
        width: '40%',
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        marginTop: 25,
    },
    overlay: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        zIndex: 1,
    },
    loadingContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
    },
    checkIcon: {
        width: 50, // Sesuaikan ukuran ikon
        height: 50, // Sesuaikan ukuran ikon
        alignSelf: 'center',
    }
});

export default SummaryScreen;
