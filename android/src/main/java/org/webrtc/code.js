import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RTCView, mediaDevices, type MediaStream, switchDeepAREffect} from 'react-native-webrtc';

const DEEP_AR_LICENSE_KEY =
  'b40d07522b8976d959e1ac9bc137a77f67a422aa77d6078efc67249e6f1db63976c2442c340d591c';


const AR_FILTERS = [
  'MakeupLook.deepar',
  'Neon_Devil_Horns.deepar',
  'Pixel_Hearts.deepar',
  'Fire_Effect.deepar',
  'burning_effect.deepar',
  'Emotion_Meter.deepar',
  'Humanoid.deepar',
  'Emotions_Exaggerator.deepar',
  'Split_View_Look.deepar',
  'Hope.deepar',
  'Stallone.deepar',
  'Ping_Pong.deepar',
  'Elephant_Trunk.deepar',
  'Vendetta_Mask.deepar',
  'Snail.deepar',
  'galaxy_background.deepar',
  'flower_face.deepar',
  'viking_helmet.deepar',
];

function getEffectPath(index) {
  if (index < 0 || index >= AR_FILTERS.length) return '';
  return `file:///android_asset/effects/${AR_FILTERS[index]}`;
}

async function requestAndroidCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Camera Permission',
      message: 'This sample needs access to your camera to show a live feed.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
      buttonNeutral: 'Ask Me Later',
    },
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}


function App() {
  const [localStream, setLocalStream] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0); // Start at 0
  const [isSwitchingFilter, setIsSwitchingFilter] = useState(false);
  const currentStreamRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
      try {
        setIsSwitchingFilter(true);
        const permissionGranted = await requestAndroidCameraPermission();
        if (!permissionGranted) {
          if (isMounted) setErrorMessage('Camera permission was denied.');
          return;
        }
        setErrorMessage('');
        const stream = await mediaDevices.getUserMedia({
          audio: false,
          video: {
            source: 'deepar',
            facingMode: 'user',
            deepAR: {
              licenseKey: DEEP_AR_LICENSE_KEY,
              lensFacing: 'front',
              effectPath: getEffectPath(0), // Always use full path
            },
          },
        });
        if (isMounted) {
          currentStreamRef.current = stream;
          setLocalStream(stream);
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch {
        if (isMounted) setErrorMessage('Failed to start camera feed.');
      } finally {
        if (isMounted) setIsSwitchingFilter(false);
      }
    };
    startCamera();
    return () => {
      isMounted = false;
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const selectedFilterName =
    selectedFilterIndex >= 0 ? AR_FILTERS[selectedFilterIndex] : 'None';

  // Switch effect using switchDeepAREffect
  const onNextFilter = () => {
    if (isSwitchingFilter || !localStream) return;
    setSelectedFilterIndex(currentIndex => {
      const nextIndex = currentIndex + 1 >= AR_FILTERS.length ? 0 : currentIndex + 1;
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const trackId = videoTracks[0].id;
        console.log('[onNextFilter] Calling switchDeepAREffect', { trackId, effectPath: getEffectPath(nextIndex) });
        try {
          switchDeepAREffect(trackId, getEffectPath(nextIndex));
          console.log('[onNextFilter] switchDeepAREffect call finished');
        } catch (err) {
          console.error('[onNextFilter] switchDeepAREffect threw error', err);
        }
      }
      return nextIndex;
    });
  };

  const onSelectNone = () => {
    if (isSwitchingFilter || !localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const trackId = videoTracks[0].id;
      console.log('[onSelectNone] Calling switchDeepAREffect', { trackId, effectPath: '' });
      try {
        switchDeepAREffect(trackId, '');
        console.log('[onSelectNone] switchDeepAREffect call finished');
      } catch (err) {
        console.error('[onSelectNone] switchDeepAREffect threw error', err);
      }
    }
    setSelectedFilterIndex(-1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <Text style={styles.title}>DeepAR Filter Camera</Text>
      <View style={styles.previewFrame}>
        {localStream ? (
          <RTCView
            streamURL={localStream.toURL()}
            objectFit="cover"
            style={styles.preview}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {errorMessage || 'Starting camera...'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.noneButton, isSwitchingFilter && styles.buttonDisabled]}
          onPress={onSelectNone}
          disabled={isSwitchingFilter}>
          <Text style={styles.noneButtonText}>None</Text>
        </Pressable>
        <View style={styles.currentFilterBox}>
          <Text style={styles.currentFilterLabel}>Current</Text>
          <Text numberOfLines={1} style={styles.currentFilterName}>
            {selectedFilterName}
          </Text>
        </View>
        <Pressable
          style={[styles.nextButton, isSwitchingFilter && styles.buttonDisabled]}
          onPress={onNextFilter}
          disabled={isSwitchingFilter}>
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', margin: 16, textAlign: 'center' },
  previewFrame: { flex: 1, margin: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#222' },
  preview: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#aaa', fontSize: 16 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16 },
  noneButton: { backgroundColor: '#444', padding: 12, borderRadius: 8 },
  noneButtonText: { color: '#fff', fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.5 },
  currentFilterBox: { flex: 1, alignItems: 'center' },
  currentFilterLabel: { color: '#aaa', fontSize: 12 },
  currentFilterName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  nextButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8 },
  nextButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default App;
