import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {arrowback} from '../../assets/icon';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateProjectScreen = () => {
  const navigation = useNavigation();
  const [P_title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [projectStart, setProjectStart] = useState('');
  const [projectEnd, setProjectEnd] = useState('');

  // Load existing projects from AsyncStorage when the component mounts
  useEffect(() => {
    const loadProjectsFromStorage = async () => {
      try {
        const storedProjects = await AsyncStorage.getItem('projects');
        if (storedProjects !== null) {
          setProjects(JSON.parse(storedProjects));
        }
      } catch (error) {
        console.error('Failed to load projects from storage', error);
      }
    };
    loadProjectsFromStorage();
  }, []);

  const saveProjectsToStorage = async newProjects => {
    try {
      await AsyncStorage.setItem('projects', JSON.stringify(newProjects));
      console.log('Projects saved successfully:', newProjects); // Log keberhasilan
    } catch (error) {
      console.error('Failed to save projects to storage', error);
    }
  };

  const handleCreatePress = async () => {
    // Basic validation
    if (!P_title || !description || !projectStart || !projectEnd) {
      alert('Please fill in all fields');
      return;
    }

    // Generate project ID
    const newId =
      projects.length > 0 ? projects[projects.length - 1].P_id + 1 : 1;

    // Create new project object
    const newProject = {
      P_id: newId, // Add ID to the project
      P_title,
      description,
      projectStart,
      projectEnd,
    };

    // Check for duplicates
    const isDuplicate = projects.some(project => project.P_title === P_title);

    if (!isDuplicate) {
      const newProjects = [...projects, newProject];
      setProjects(newProjects);
      await saveProjectsToStorage(newProjects); // Save to AsyncStorage
      console.log('New project added:', newProjects);
      // Navigate to the project screen after creation
      navigation.navigate('Project1screen');
    } else {
      alert('A project with this title already exists');
      console.log('Duplicate project found:', P_title);
    }
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView>
        <Text style={styles.text1}>Title</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter project title"
          value={P_title}
          onChangeText={setTitle}
          maxLength={40}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.text2}>Description</Text>
        <TextInput
          style={styles.inputBox2}
          placeholder="Enter project description"
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          placeholderTextColor="#C0C0C0"
          multiline
        />

        <Text style={styles.text2}>Project Start</Text>
        <TouchableOpacity
          style={styles.inputBox}
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


        <Text style={styles.text2}>Project End</Text>
        <TouchableOpacity
          style={styles.inputBox}
          onPress={() => setOpenStartDatePicker(true)}
        >
          <Text
            style={[
              styles.dateText,
              { color: projectEnd ? '#000000' : '#808080' } // black if selected, gray if placeholder
            ]}
          >
            {projectEnd || 'Select end date'}
            {/* show placeholder if empty */}
          </Text>
        </TouchableOpacity>

        <DatePicker
            modal
            open={openStartDatePicker}
            date={selectedStartDate || new Date()} // default to today if null
            mode="date"
            onConfirm={date => {
              setOpenEndDatePicker(false);
              setSelectedEndDate(date); // store Date object
              setProjectEnd(
                date.toLocaleDateString('id-ID') // formatted string for display
              );
            }}
            onCancel={() => {
              setOpenEndDatePicker(false);
            }}
          />
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
        <Text style={styles.text4}>Create</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    height: 45,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginBottom: 10,
    marginTop: 5,
    marginHorizontal: 16,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    color: '#000000',
  },
  text1: {
    fontSize: 16,
    color: '#000000',
    marginTop: 5,
    left: 16,
  },
  text2: {
    fontSize: 16,
    color: '#000000',
    marginTop: 15,
    left: 16,
  },
  dateText: {
    fontSize: 16, // Ukuran font
    color: '#000000', // Warna teks
    textAlign: 'left', // Posisi teks (bisa 'center' jika diinginkan)
  },
  text4: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  inputBox2: {
    height: 90,
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    color: '#000000',
  },
  createButton: {
    marginHorizontal: 16,
    height: 45,
    backgroundColor: '#4541E4',
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 5,
    justifyContent: 'center',
  },
});

export default CreateProjectScreen;
