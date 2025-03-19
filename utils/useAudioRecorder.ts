import { Audio } from "expo-av";
import { useCallback, useEffect, useState } from "react";

import {
  type ApiResult,
  type Feedback,
  failingMessages,
  passingMessages,
} from "@/utils/types";

export function useAudioRecorder() {
  const [recordingObject, setRecordingObject] = useState<Audio.Recording>();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hookParams, setHookParams] = useState<{
    expectedText: string;
    apiUrl: string;
    resultCallback: (result: ApiResult) => void;
  } | null>();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Hold the button and read the sentence!",
  );

  useEffect(() => {
    const checkRecordingDuration = async () => {
      if (recordingObject && isRecording) {
        const status = await recordingObject.getStatusAsync();
        if (status.isRecording && status.durationMillis >= 5000) {
          await stopRecording();
        }
      }
    };

    const interval = setInterval(checkRecordingDuration, 100);
    return () => clearInterval(interval);
  }, [recordingObject, isRecording]);

  const record = async (
    expectedText: string,
    apiUrl: string,
    resultCallback: (result: ApiResult) => void,
  ) => {
    setHookParams({ expectedText, apiUrl, resultCallback });

    try {
      setIsRecording(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecordingObject(recording);
    } catch (err) {
      setIsRecording(false);
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        await recordingObject?.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        setIsRecording(false);

        const uri = recordingObject?.getURI() ?? "";
        setRecordingObject(undefined);

        await callApi(uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const callApi = async (uri: string) => {
    try {
      setIsUploading(true);
      const fileName = uri.split("/").pop() || "audio.m4a";
      const formData = new FormData();
      const audio_file = {
        uri,
        name: fileName,
        type: "audio/m4a",
      };

      // biome-ignore lint/suspicious/noExplicitAny: bruh
      formData.append("audio", audio_file as any);
      formData.append("expected_text", hookParams!.expectedText);

      const response = await fetch(hookParams!.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result: ApiResult = await response.json();
      console.log(result);
      setFeedback(result.feedback);

      if (result.grade >= 0.8) {
        setScores((prev) => [...prev, Math.ceil(result.grade * 10)]);
        setMessage(
          passingMessages[Math.floor(Math.random() * passingMessages.length)],
        );
      } else {
        setMessage(
          failingMessages[Math.floor(Math.random() * failingMessages.length)],
        );
      }

      hookParams!.resultCallback(result);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading audio", error);
    }
  };

  const getGrade = useCallback(
    (length: number) => {
      const total = scores.reduce((a, b) => a + b, 0);
      return total / (length * 10);
    },
    [scores],
  );

  return {
    record,
    stopRecording,
    recording: recordingObject,
    isUploading,
    feedback,
    setFeedback,
    scores,
    getGrade,
    message,
  };
}
