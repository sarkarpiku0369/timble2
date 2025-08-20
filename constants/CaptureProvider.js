import { saveToLibraryAsync } from "expo-media-library";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Stack, YStack } from "tamagui";

const CaptureContext = createContext({
  capture: () => Promise.resolve(null),
  setImageRef: () => {},
});

export const CaptureProvider = ({ children }) => {
  const [imageRef, setImageRef] = useState(null);

  const capture = async () => {
    if (imageRef?.current) {
      try {
        const uri = await captureRef(imageRef.current, {
          format: "png",
          quality: 1,
        });

        await saveToLibraryAsync(uri);

        if (uri) {
          Alert.alert("📸 Picture taken successfully!");
          return uri;
        }
      } catch (error) {
        console.error("Capture error:", error);
        return null;
      }
    } else {
      Alert.alert("There is no ref to capture");
    }

    return null;
  };

  return (
    <CaptureContext.Provider value={{ capture, setImageRef }}>
      {children}
    </CaptureContext.Provider>
  );
};

export const CaptureWrapper = ({ children, ...props }) => {
  const imageRef = useRef(null);
  const { setImageRef } = useContext(CaptureContext);

  useEffect(() => {
    setImageRef(imageRef);
  }, [setImageRef]);

  return (
    <YStack ref={imageRef} {...props}>
      {children}
    </YStack>
  );
};

export const useCapture = () => {
  const { capture } = useContext(CaptureContext);
  return { capture };
};
