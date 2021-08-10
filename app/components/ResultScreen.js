import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

const ResultScreen = ({ route }) => {
  const { resultImg, isSuccess } = route.params;
  const uri = resultImg ? resultImg : 'https://via.placeholder.com/150';

  return (
    <View style={styles.container}>
      <Image
        style={{
          // position: 'absolute',
          width: 250,
          height: 350,
          resizeMode: 'contain',
        }}
        source={{ uri }}
      />
      <Text style={{ marginTop: 16 }}>
        {isSuccess
          ? 'Successful identification!'
          : 'Failed identification. Try again'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ResultScreen;
