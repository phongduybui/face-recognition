import React, { useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
} from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(' ');
  const onSubmit = () => {
    axios
      .post('http://192.168.1.7:5000/login', { username, password })
      .then(({ data }) => {
        if (data.error) {
          setError(data.error);
        } else {
          navigation.navigate('Home', { user: data.user });
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <TextInput
        style={{
          width: 320,
          height: 70,
          borderWidth: 1,
          padding: 16,
          fontSize: 22,
        }}
        placeholder='Enter username'
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={{
          width: 320,
          height: 70,
          marginVertical: 20,
          borderWidth: 1,
          padding: 16,
          fontSize: 22,
        }}
        secureTextEntry={true}
        placeholder='Enter password'
        onChangeText={setPassword}
        value={password}
      />
      <TouchableOpacity
        style={{
          width: 320,
          height: 70,
        }}
      >
        <Button onPress={onSubmit} title='Sign in' color='#841584' />
      </TouchableOpacity>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </SafeAreaView>
  );
};

export default LoginScreen;
