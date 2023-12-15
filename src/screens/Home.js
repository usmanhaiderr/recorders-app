import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  PermissionsAndroid,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import {Button, Icon} from '@rneui/base';
import AudioRecord from 'react-native-audio-record';
import {Buffer} from 'buffer';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import LottieView from 'lottie-react-native';
import {BASE_URL} from '../utils/BASE_URL';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../context/AuthContext';
import Clipboard from '@react-native-clipboard/clipboard';
import Snackbar from 'react-native-snackbar';

const Home = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [url, setUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [chatData, setChatData] = useState('');
  const [voiceData, setVoiceData] = useState('');
  const [loading, setIsLoading] = useState(false);

  const {setIsUserLoggedIn} = useContext(AuthContext);

  const animationRef = useRef(null);

  console.log('URL ==>', url);

  useEffect(() => {
    animationRef.current?.play();

    animationRef.current?.play(30, 120);
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'This app needs access to your microphone for recording audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Microphone permission granted');
      } else {
        console.log('Microphone permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    const getPermission = async () => {
      await requestMicrophonePermission();
    };
    getPermission();
  }, []);

  //   ******************START RECORDING FUNCTION******************

  const startRecording = () => {
    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
    };

    AudioRecord.init(options);
    AudioRecord.on('data', data => {
      const chunks = Buffer.from(data, 'base64');
    });
    try {
      AudioRecord.start();
      setIsRecording(true);
    } catch (err) {
      console.log('Error while Recording ===>', err);
    }
  };

  // ******************STOP RECORDING FUNCTION******************

  const stopRecording = async () => {
    const audioFile = await AudioRecord.stop();
    if (audioFile) {
      setIsRecording(false);
      setUrl(audioFile);
    }
  };

  const startTranscript = async () => {
    if (url) {
      setIsLoading(true);

      const apiUrl = `${BASE_URL}/api/audio`;
      const filePath = url;
      const fileName = 'audio.wav';

      try {
        const response = await RNFetchBlob.fetch(
          'POST',
          apiUrl,
          {
            'Content-Type': 'multipart/form-data',
          },
          [
            {
              name: 'file',
              filename: fileName,
              data: RNFetchBlob.wrap(filePath),
            },
          ],
        );
        setVoiceData(response?.data);
        if (response?.data) {
          axios
            .post(`${BASE_URL}/api/chat`, {
              message: `The following is a transcript of an appointment between a doctor and a patient. Transform it into SOAP format. ${response?.data}`,
            })
            .then(res => {
              if (res) {
                setChatData(res?.data?.choices[0]?.message?.content);
                setModalVisible(true);
                setIsLoading(false);
              }
            })
            .catch(err => {
              Alert.alert('Error', err);
            });
        }
      } catch (error) {
        Alert.alert('Error', error);
      }
    }
  };

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        AsyncStorage.removeItem('user');
        setIsUserLoggedIn(false);
      })
      .catch(err => console.log('Error in Logout ===>', err));
  };

  return (
    <>
      <Button
        onPress={handleLogout}
        title={'Logout'}
        containerStyle={{
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          backgroundColor: '#ffffff',
        }}
        buttonStyle={{
          borderWidth: 1,
          width: '20%',
          justifyContent: 'center',
          borderRadius: 5,
          marginRight: 10,
          marginVertical: 0,
          backgroundColor: 'red',
          borderColor: 'red',
          marginTop: 10,
        }}
        titleStyle={{fontSize: 13}}
      />
      <View style={styles.container}>
        {isRecording && (
          <LottieView
            source={require('../../waves.json')}
            autoPlay
            loop
            style={{flex: 1}}
          />
        )}
        <View
          style={[
            styles.buttonContainer,
            {marginTop: isRecording ? 0 : '50%'},
          ]}>
          <Button
            onPress={startRecording}
            title={'Start Recording'}
            buttonStyle={{borderRadius: 5, marginVertical: 0, width: '80%'}}
            titleStyle={{paddingVertical: 5}}
            disabled={!isRecording ? false : true}
          />
          <Button
            onPress={stopRecording}
            title={'Stop Recording'}
            buttonStyle={{borderRadius: 5, marginVertical: 0, width: '80%'}}
            titleStyle={{paddingVertical: 5}}
            disabled={!isRecording ? true : false}
          />
        </View>
        <Button
          title={'Start Transcript'}
          buttonStyle={{borderRadius: 5, marginBottom: '50%'}}
          titleStyle={{paddingVertical: 5}}
          onPress={startTranscript}
          disabled={!url}
          loading={loading ? true : false}
          loadingProps={{animating: true, color: '#ffffff'}}
        />
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Icon
                name="content-copy"
                style={{
                  alignItems: 'flex-end',
                  paddingHorizontal: 20,
                  marginTop: 10,
                }}
                color={'#000000'}
                onPress={() => {
                  Clipboard.setString(chatData);
                  Snackbar.show({
                    text: 'Text copied in clipboard',
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: 'white',
                    textColor: 'black',
                    marginBottom: 20,
                  });
                }}
              />

              <Text style={styles.headingText}>
                {voiceData && JSON.parse(voiceData)}
              </Text>
              <Text style={styles.assisText}>{chatData}</Text>
              <View style={{alignItems: 'center'}}>
                <Button
                  onPress={() => {
                    setModalVisible(false);
                    setChatData('');
                    setVoiceData('');
                    setUrl('');
                  }}
                  title={'Back'}
                  titleStyle={{paddingVertical: 5}}
                  containerStyle={{width: 150, marginBottom: 40}}
                  buttonStyle={{borderRadius: 5}}
                  icon={
                    <Icon
                      name="arrow-back"
                      color={'#ffffff'}
                      style={{marginRight: 10}}
                    />
                  }
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    paddingTop: '29%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  headingText: {
    fontSize: 16,
    color: '#0361cc',
    marginVertical: 20,
  },
  assisText: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 20,
  },
});

export default Home;
