import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {camera, arrowback, location2} from '../../assets/icon';
import {launchCamera} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';
import openMap from 'react-native-open-maps';
import Geolocation from 'react-native-geolocation-service';

const Createlocationscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const session = route.params?.session || {};
  const [S_id, setSid] = useState('');
  const [S_title, setStitle] = useState('');
  const [P_id, setPid] = useState('');
  const [P_title, setPtitle] = useState('');
  const [L_title, setLtitle] = useState('');
  const [description, setDescription] = useState('');
  const [soil, setSoil] = useState('');
  const [air, setAir] = useState('');
  const [surface, setSurface] = useState('');
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [projectStart, setProjectStart] = useState('');
  const [material, setMaterial] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const [locations, setLocations] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    const loadLocationsFromStorage = async () => {
      try {
        const storedLocations = await AsyncStorage.getItem('locations');
        if (storedLocations !== null) {
          setLocations(JSON.parse(storedLocations));
        }
      } catch (error) {
        console.error('Failed to load locations from storage', error);
      }
    };

    //requestLocationPermission();
    loadLocationsFromStorage();
    getCurrentLocation();
    setPtitle(session.P_title);
    setPid(session.P_id);
    setStitle(session.S_title);
    setSid(session.S_id);
  }, [session.S_id]);

  const saveLocationsToStorage = async newLocations => {
    try {
      await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
      console.log('Locations saved successfully:', newLocations);
    } catch (error) {
      console.error('Failed to save locations to storage', error);
    }
  };

  // Fungsi untuk mendapatkan lokasi saat ini
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      error => {
        if (error.code === 2) {
          if (error.message === 'No location provider available.') {
            Alert.alert(
              'Unable to retrieve location',
              'Please enable location mode on your device and recreate the location.',
            );
            navigation.goBack();
          } else if (error.message === 'Unable to retrieve location.') {
            Alert.alert(
              'Failed to retrieve location',
              'Please turn on location mode on your device and recreate the location.',
            );
            navigation.goBack();
          } else {
            Alert.alert('Failed to retrieve location', error.message);
            navigation.goBack();
          }
        } else {
          Alert.alert('Failed to retrieve location', error.message);
          navigation.goBack();
        }
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 10000},
    );
  };

  const handleOpenMap = () => {
    if (latitude && longitude) {
      openMap({latitude, longitude});
    } else {
      Alert.alert(
        'Location not available',
        'Please wait until your location is detected.',
      );
    }
  };

  const handleCreatePress = async () => {
    if (
      !L_title ||
      !description ||
      !soil ||
      !projectStart ||
      !latitude ||
      !longitude
    ) {
      Alert.alert('Alert', 'Please fill in all fields');
      return;
    }

    const newId =
      locations.length > 0 ? locations[locations.length - 1].L_id + 1 : 1;

    const newLocation = {
      L_id: newId,
      L_title,
      S_id,
      S_title,
      P_id,
      P_title,
      imageUris,
      description,
      projectStart,
      latitude,
      longitude,
      soil,
      air,
      surface,
      material,
    };

    const isDuplicate = locations.some(
      location =>
        location.L_title === L_title &&
        location.P_id === P_id &&
        location.S_id === S_id,
    );
    /*
        // Pastikan `imageUris` tidak kosong sebelum navigasi
        if (imageUris.length === 0) {
            Alert.alert('No images captured');
            return;
        }
        */
    if (!isDuplicate) {
      const newLocations = [...locations, newLocation];
      setLocations(newLocations);
      await saveLocationsToStorage(newLocations);

      navigation.navigate('Sessioninfoscreen', {session});
    } else {
      Alert.alert('Alert', 'A session with this title already exists');
    }
  };

  const handleCameraPress = () => {
    launchCamera({mediaType: 'photo', saveToPhotos: true}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        const dateTaken = new Date().toLocaleString(); // Ambil waktu saat ini

        // Simpan URI gambar ke dalam array
        setImageUris(prevUris => [
          ...prevUris,
          {uri, dateTaken}, // Simpan uri dan tanggal
        ]);
      }
    });
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <View>
          <Text style={styles.text1}>Title</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter location title"
            value={L_title}
            onChangeText={setLtitle}
            maxLength={40}
            placeholderTextColor="#C0C0C0"
          />
        </View>
        <View>
          <Text style={styles.text1}>Description</Text>
          <TextInput
            style={styles.inputBox2}
            placeholder="Enter location description"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            placeholderTextColor="#C0C0C0"
            multiline
          />
        </View>
        <View>
          <Text style={styles.text1}>Soil Moisture Content</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Enter Soil"
            value={soil}
            onChangeText={setSoil}
            placeholderTextColor="#C0C0C0"
            maxLength={25}
          />
        </View>
        <View>
          <Text style={styles.text1}>Location Start</Text>
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => setOpenStartDatePicker(true)}>
            <Text style={styles.dateText}>
              {projectStart ? projectStart : 'Select start date'}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            open={openStartDatePicker}
            date={selectedStartDate}
            mode="date"
            onConfirm={date => {
              setOpenStartDatePicker(false);
              setSelectedStartDate(date);
              setProjectStart(date.toLocaleDateString('id-ID')); // Mengubah format sesuai kebutuhan
            }}
            onCancel={() => {
              setOpenStartDatePicker(false);
            }}
          />
        </View>
        <View>
          {imageUris.length > 0 ? (
            <View style={styles.imageContainer}>
              {imageUris.map((image, index) => (
                <Image
                  key={index}
                  source={{uri: image.uri}}
                  style={styles.image}
                />
              ))}
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Text style={styles.text5}>No images taken yet</Text>
            </View>
          )}
        </View>

        <Text style={styles.text3}>Picture</Text>
        <TouchableOpacity style={styles.cambutton} onPress={handleCameraPress}>
          <Image source={camera} style={styles.camIcon} />
          <Text style={styles.text4}>Tap to take a picture</Text>
        </TouchableOpacity>

        <View>
          {latitude && longitude ? (
            <Text style={styles.locationText}>
              Latitude: {latitude}, Longitude: {longitude}
            </Text>
          ) : (
            <Text style={styles.locationText}>Location</Text>
          )}
          <TouchableOpacity style={styles.cambutton} onPress={handleOpenMap}>
            <Image source={location2} style={styles.locIcon} />
            <Text style={styles.text4}>Open Maps</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.text1}>Air Temperature</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter air temperature"
          value={air}
          onChangeText={setAir}
          maxLength={25}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Surface Temperature</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter surface temperature"
          value={surface}
          onChangeText={setSurface}
          maxLength={25}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Material Temperature</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter material"
          value={material}
          onChangeText={setMaterial}
          maxLength={25}
          placeholderTextColor="#C0C0C0"
        />
      </ScrollView>
      <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
        <Text style={styles.text9}>Create</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row', // Menyusun gambar dalam satu baris
    flexWrap: 'wrap', // Membungkus gambar ke baris berikutnya jika penuh
    justifyContent: 'flex-start', // Mengatur gambar agar mulai dari kiri
    marginTop: 20,
    marginHorizontal: 16,
  },
  container: {
    top: 16,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 5,
    margin: 2,
  },
  inputBox: {
    marginHorizontal: 16,
    height: 45,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: '#000000',
  },
  text1: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
    marginLeft: 16,
  },
  dateText: {
    fontSize: 16, // Ukuran font
    color: '#000000', // Warna teks
    textAlign: 'left', // Posisi teks (bisa 'center' jika diinginkan)
  },
  text3: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
    marginLeft: 16,
  },
  text4: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 55,
  },
  text9: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  inputBox2: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    color: '#000000',
  },
  createButton: {
    height: 45,
    marginHorizontal: 16,
    backgroundColor: '#4541E4',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 30,
    justifyContent: 'center',
  },
  cambutton: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: '#4541E4',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  boxloc: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: '#4541E4',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
  },
  camIcon: {
    width: 40,
    height: 35,
    alignSelf: 'center',
    top: 14,
  },
  locIcon: {
    width: 30,
    height: 37,
    alignSelf: 'center',
    top: 14,
  },
  text5: {
    fontSize: 16,
    color: 'red',
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 16,
    marginTop: 5,
  },
});

export default Createlocationscreen;
