import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

const HomeScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [uri, setUri] = useState('https://via.placeholder.com/150');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const ref = useRef();

  const snap = async () => {
    if (ref.current) {
      try {
        let photo = await ref.current.takePictureAsync({
          base64: true,
          exif: true,
        });
        ref.current.pausePreview();

        // Rotate image (IOS only)
        photo = await ImageManipulator.manipulateAsync(
          photo.uri,
          [
            {
              rotate: 0,
            },
            {
              resize: {
                width: photo.width,
                height: photo.height,
              },
            },
          ],
          {
            compress: 1,
            base64: true,
          }
        );
        // console.log(photo);
        setLoading(true);
        const response = await axios.post('http://192.168.1.7:5000/upload', {
          file: photo.base64,
          userId: route.params.user.id,
        });
        setLoading(false);

        const { dataUrl, isSuccess } = response.data;
        navigation.navigate('Result', { resultImg: dataUrl, isSuccess });

        // setUri(`data:image/jpg;base64,${photo.base64}`);
        // console.log(response.data);
      } catch (error) {
        console.log(error);
      }
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
        {loading && (
          <ActivityIndicator style={{ flex: 1 }} size='large' color='#0000ff' />
        )}
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
          {/* <Image
            style={{
              position: 'absolute',
              width: 250,
              height: 350,
              resizeMode: 'contain',
            }}
            source={{ uri }}
          /> */}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
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
