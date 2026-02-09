import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {arrowback, plus, trash} from '../../assets/icon';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native'; // Import useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';

const Project1screen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sensorDatas, setSensorDatas] = useState([]);

  // Fungsi untuk mengambil daftar proyek dari AsyncStorage
  const loadProjectsFromStorage = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
        console.log(
          'All projects loaded successfully:',
          JSON.parse(storedProjects),
        ); // Log saat data berhasil dimuat
      } else {
        console.log('No projects found in storage.');
      }
    } catch (error) {
      console.error('Failed to load projects from storage', error);
    }
  };

  // Fungsi untuk mengambil daftar sesi dari AsyncStorage
  const loadSessionsFromStorage = async () => {
    try {
      const storedSessions = await AsyncStorage.getItem('sessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        setSessions(parsedSessions);
        console.log('All sessions loaded successfully:', parsedSessions); // Log saat data berhasil difilter dan dimuat
      } else {
        console.log('No sessions found.');
      }
    } catch (error) {
      console.error('Failed to load sessions from storage', error);
    }
  };

  // Fungsi untuk mengambil daftar lokasi dari AsyncStorage
  const loadLocationsFromStorage = async () => {
    try {
      const storedLocations = await AsyncStorage.getItem('locations');
      if (storedLocations) {
        const parsedLocations = JSON.parse(storedLocations);
        setLocations(parsedLocations);
        console.log('All locations loaded successfully:', parsedLocations); // Log saat data berhasil difilter dan dimuat
      } else {
        console.log('No locations found.');
      }
    } catch (error) {
      console.error('Failed to load locations from storage', error);
    }
  };

  const loadSensorDataFromStorage = async () => {
    try {
      const storedSensorDatas = await AsyncStorage.getItem('SensorDatas');
      if (storedSensorDatas) {
        setSensorDatas(JSON.parse(storedSensorDatas));
        console.log(
          'SensorDatas loaded successfully:',
          JSON.parse(storedSensorDatas),
        );
      }
    } catch (error) {
      console.error('Failed to load SensorDatas from storage', error);
    }
  };

  // Memuat ulang proyek setiap kali layar difokuskan
  useFocusEffect(
    React.useCallback(() => {
      loadProjectsFromStorage();
      loadSessionsFromStorage();
      loadLocationsFromStorage();
      loadSensorDataFromStorage();
    }, []),
  );

  const handleProjectClick = project => {
    // Navigasi ke ProjectInfoScreen dengan detail proyek
    navigation.navigate('Projectinfoscreen', {project});
  };

  // Fungsi untuk menghapus proyek dengan konfirmasi
  const handleDeleteProject = index => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this project?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const projectToDelete = projects[index];
            const newProjects = projects.filter((_, i) => i !== index);
            setProjects(newProjects);
            console.log('Projects deleted successfully:', newProjects);

            // Filter out sessions and locations related to the project
            const newSessions = sessions.filter(
              session => session.P_id !== projectToDelete.P_id,
            );
            const newLocations = locations.filter(
              location => location.P_id !== projectToDelete.P_id,
            );
            const newSensorDatas = sensorDatas.filter(
              sensorData => sensorData.P_id !== projectToDelete.P_id,
            );

            setSessions(newSessions);
            setLocations(newLocations);
            setSensorDatas(newSensorDatas);

            await saveProjectsToStorage(newProjects); // Simpan perubahan ke AsyncStorage
            await saveSessionsToStorage(newSessions); // Simpan sesi yang telah diperbarui
            await saveLocationsToStorage(newLocations); // Simpan lokasi yang telah diperbarui
            await saveSensorToStorage(newSensorDatas);
          },
          style: 'destructive',
        },
      ],
    );
  };

  // Fungsi untuk menyimpan proyek ke AsyncStorage
  const saveProjectsToStorage = async newProjects => {
    try {
      await AsyncStorage.setItem('projects', JSON.stringify(newProjects));
      console.log('Projects saved successfully:', newProjects); // Log saat data berhasil disimpan
    } catch (error) {
      console.error('Failed to save projects to storage', error);
    }
  };

  // Fungsi untuk menyimpan sesi ke AsyncStorage
  const saveSessionsToStorage = async newSessions => {
    try {
      await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
      console.log('Sessions saved successfully:', newSessions); // Log saat data berhasil disimpan
    } catch (error) {
      console.error('Failed to save sessions to storage', error);
    }
  };

  // Fungsi untuk menyimpan lokasi ke AsyncStorage
  const saveLocationsToStorage = async newLocations => {
    try {
      await AsyncStorage.setItem('locations', JSON.stringify(newLocations));
      console.log('Locations saved successfully:', newLocations); // Log saat data berhasil disimpan
    } catch (error) {
      console.error('Failed to save locations to storage', error);
    }
  };

  const saveSensorToStorage = async newSensorDatas => {
    try {
      await AsyncStorage.setItem('SensorDatas', JSON.stringify(newSensorDatas));
      console.log('SensorDatas saved successfully:', newSensorDatas);
    } catch (error) {
      console.error('Failed to save SensorDatas to storage', error);
    }
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      {projects.length > 0 ? (
        <ScrollView>
          {/* Menampilkan daftar proyek secara dinamis */}
          {projects.map((project, index) => (
            <TouchableOpacity
              key={index}
              style={styles.box}
              onPress={() => handleProjectClick(project)}>
              <View style={styles.projectInfo}>
                <View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.text1}>{project.P_title}</Text>
                    <Text style={styles.text2}>{project.description}</Text>
                  </View>
                  {/* Menampilkan tanggal mulai dan akhir proyek */}
                  <View style={styles.dateContainer}>
                    <Text style={styles.text3}>
                      Start: {project.projectStart}
                    </Text>
                    <Text style={styles.text4}>End: {project.projectEnd}</Text>
                  </View>
                </View>
                {/* Ikon trash untuk menghapus proyek */}
                <TouchableOpacity onPress={() => handleDeleteProject(index)}>
                  <Image source={trash} style={styles.trashIcon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.centeredContainer}>
          <Text style={styles.noImageText}>No project saved</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.circle}
        onPress={() => navigation.navigate('Createprojectscreen')}>
        <Image source={plus} style={styles.PlusIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 16,
    backgroundColor: '#FFCC00',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    width: '90%',
  },
  text1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
    textAlign: 'justify',
  },
  text2: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
    textAlign: 'justify',
    color: '#000000',
  },
  dateContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  text3: {
    fontSize: 12,
    color: '#000000',
    marginRight: 10,
  },
  text4: {
    fontSize: 12,
    color: '#000000',
  },
  centeredContainer: {
    flex: 1, // Membuat container memenuhi layar
    justifyContent: 'center', // Mengatur konten agar berada di tengah secara vertikal
    alignItems: 'center', // Mengatur konten agar berada di tengah secara horizontal
  },
  noImageText: {
    fontSize: 16,
    color: '#000',
    marginTop: -70,
  },
  trashIcon: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    marginRight: 10,
  },
  circle: {
    width: 46,
    height: 46,
    backgroundColor: '#4541E4',
    borderRadius: 30,
    position: 'absolute',
    right: 16,
    bottom: 50,
    justifyContent: 'center',
  },
  PlusIcon: {
    marginTop: 2,
    width: 20,
    height: 20,
    tintColor: 'white',
    alignSelf: 'center',
  },
});

export default Project1screen;
