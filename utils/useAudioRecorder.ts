import { Audio } from "expo-av";
import { useCallback, useState } from "react";

import {
  type ApiResult,
  type Feedback,
  failingMessages,
  passingMessages,
} from "@/utils/types";

export function useAudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [message, setMessage] = useState(
    "Hold the button and read the sentence!",
  );

  const record = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async (
    expectedText: string,
    apiUrl: string,
    gradeCallback: (grade: number) => void,
  ) => {
    try {
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI() ?? "";
      setRecording(undefined);
      await callApi(uri, expectedText, apiUrl, gradeCallback);
    } catch (err) {
      console.error(err);
    }
  };

  const callApi = async (
    uri: string,
    expectedText: string,
    apiUrl: string,
    gradeCallback: (grade: number) => void,
  ) => {
    try {
      setIsUploading(true);
      const fileName = uri.split("/").pop() || "audio.m4a";
      const formData = new FormData();
      const audio_file = {
        uri,
        name: fileName,
        type: "audio/m4a",
      };

      formData.append("audio", audio_file as any);
      formData.append("expected_text", expectedText);

      const response = await fetch(apiUrl, {
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
      gradeCallback(result.grade);
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
    recording,
    isUploading,
    feedback,
    setFeedback,
    scores,
    getGrade,
    message,
  };
}
