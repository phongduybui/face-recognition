import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

const HomeScreen = ({ route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [uri, setUri] = useState('https://via.placeholder.com/150');
  const [type, setType] = useState(Camera.Constants.Type.back);

  const ref = useRef();

  console.log(route.params.user);

  const snap = async () => {
    if (ref.current) {
      let photo = await ref.current.takePictureAsync({ base64: true });
      const dataUrl = `data:image/jpg;base64,${photo.base64}`;

      const response = await axios.post('http://192.168.1.7:5000/upload', {
        file: photo.base64,
      });
      setUri(response.data);
      console.log(response.data);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={ref}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={snap}>
            <Text style={styles.text}> Capture </Text>
          </TouchableOpacity>
          <Image
            style={{
              position: 'absolute',
              width: 500,
              height: 700,
              resizeMode: 'contain',
              transform: [{ rotate: '90deg' }],
            }}
            source={{ uri }}
          />
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 12,
    margin: 6,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

export default HomeScreen;
