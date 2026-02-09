import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {arrowback} from '../../assets/icon';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';

const Sessionscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Ambil project dari parameter route
  const project = route.params?.project || {};
  const [S_title, setTitle] = useState('');
  const [P_id, setPid] = useState('');
  const [P_title, setPtitle] = useState('');
  const [description, setDescription] = useState('');
  const [wheater, setWheater] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [layer, setLayer] = useState('');
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [projectStart, setProjectStart] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadSessionsFromStorage = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem('sessions');
        if (storedSessions !== null) {
          setSessions(JSON.parse(storedSessions));
        }
      } catch (error) {
        console.error('Failed to load sessions from storage', error);
      }
    };
    loadSessionsFromStorage();
    setPtitle(project.P_title);
    setPid(project.P_id);
  }, [project.P_id]);

  const saveSessionsToStorage = async newSessions => {
    try {
      await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));
      console.log('Sessions saved successfully:', newSessions);
    } catch (error) {
      console.error('Failed to save sessions to storage', error);
    }
  };

  const handleCreatePress = async () => {
    if (
      !S_title ||
      !P_id ||
      !P_title ||
      !description ||
      !wheater ||
      !materialType ||
      !layer ||
      !projectStart
    ) {
      alert('Please fill in all fields');
      return;
    }

    const newId =
      sessions.length > 0 ? sessions[sessions.length - 1].S_id + 1 : 1;

    const newSession = {
      S_id: newId,
      S_title,
      P_id,
      P_title,
      description,
      wheater,
      materialType,
      layer,
      projectStart,
    };

    const isDuplicate = sessions.some(
      session => session.S_title === S_title && session.P_id === P_id,
    );

    if (!isDuplicate) {
      const newSessions = [...sessions, newSession];
      setSessions(newSessions);
      await saveSessionsToStorage(newSessions);

      navigation.navigate('Projectinfoscreen', {project});
    } else {
      alert('A session with this title already exists');
    }
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <Text style={styles.text1}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter session title"
          value={S_title}
          onChangeText={setTitle}
          maxLength={40}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Description</Text>
        <TextInput
          style={styles.input1}
          placeholder="Enter session description"
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          placeholderTextColor="#C0C0C0"
          multiline
        />

        <Text style={styles.text1}>Wheater</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter wheater"
          value={wheater}
          onChangeText={setWheater}
          maxLength={40}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Material Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter material type"
          value={materialType}
          onChangeText={setMaterialType}
          maxLength={40}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Layer</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter layer"
          value={layer}
          onChangeText={setLayer}
          maxLength={25}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text1}>Session Start</Text>
        <TouchableOpacity
                  style={styles.input}
                  onPress={() => setOpenStartDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      { color: projectStart ? '#000000' : '#808080' } // black if selected, gray if placeholder
                    ]}
                  >
                    {projectStart || 'Select start date'}
                    {/* show placeholder if empty */}
                  </Text>
                </TouchableOpacity>

        <DatePicker
                    modal
                    open={openStartDatePicker}
                    date={selectedStartDate || new Date()} // default to today if null
                    mode="date"
                    onConfirm={date => {
                      setOpenStartDatePicker(false);
                      setSelectedStartDate(date); // store Date object
                      setProjectStart(
                        date.toLocaleDateString('id-ID') // formatted string for display
                      );
                    }}
                    onCancel={() => {
                      setOpenStartDatePicker(false);
                    }}
                  />
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleCreatePress}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  input: {
    height: 45,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4541E4',
    height: 45,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
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
  input1: {
    marginHorizontal: 16,
    height: 90,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    color: '#000000'
  },
});

export default Sessionscreen;
