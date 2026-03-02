import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export type RecorderState = 'idle' | 'recording' | 'uploading';

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, [cleanup]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setState('recording');
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      return true;
    } catch {
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    cleanup();

    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      recordingRef.current = null;
      setState('idle');
      return uri;
    } catch {
      recordingRef.current = null;
      setState('idle');
      return null;
    }
  }, [cleanup]);

  const cancelRecording = useCallback(async () => {
    cleanup();

    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    recordingRef.current = null;
    setState('idle');
  }, [cleanup]);

  return {
    state,
    setState,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
