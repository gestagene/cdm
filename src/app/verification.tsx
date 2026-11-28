
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import type {
  CameraCapturedPicture,
} from "expo-camera";

import type { Directory } from "expo-file-system";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

import {
  createVerificationSession,
  storeVerificationPhoto,
  deleteVerificationPhoto,
  clearVerificationSession,
} from "../utils/verificationFiles";

/* ---------- TYPES ---------- */

type Step = "id" | "selfie" | "complete";

type CapturedFile = {
  uri: string;
  name: string;
  type: string;
  width: number;
  height: number;
};

/* ---------- VERIFICATION SCREEN ---------- */

export default function Verification() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cameraRef = useRef<CameraView>(null);
  const captureLock = useRef(false);

  // Tracks whether the screen is still mounted.
  const isMounted = useRef(false);

  // Dedicated folder for this verification attempt.
  const sessionDirectory = useRef<Directory | null>(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [step, setStep] = useState<Step>("id");

  const [storageReady, setStorageReady] =
    useState(false);

  const [storageError, setStorageError] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [isCapturing, setIsCapturing] =
    useState(false);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [cameraSession, setCameraSession] =
    useState(0);

  const [preview, setPreview] =
    useState<CameraCapturedPicture | null>(null);

  const [idFile, setIdFile] =
    useState<CapturedFile | null>(null);

  const [selfieFile, setSelfieFile] =
    useState<CapturedFile | null>(null);

  /* ---------- SESSION LIFECYCLE ---------- */

  useEffect(() => {
    isMounted.current = true;

    if (Platform.OS !== "web") {
      try {
        sessionDirectory.current =
          createVerificationSession();

        setStorageReady(true);
        setStorageError(false);
      } catch (error) {
        console.error(
          "VERIFICATION STORAGE ERROR:",
          error
        );

        setStorageReady(false);
        setStorageError(true);
      }
    }

    // Runs when the verification screen unmounts.
    return () => {
      isMounted.current = false;

      const directory = sessionDirectory.current;

      sessionDirectory.current = null;

      clearVerificationSession(directory);
    };
  }, []);

  /* ---------- RETRY STORAGE ---------- */

  const retryStorage = () => {
    try {
      if (
        sessionDirectory.current &&
        !clearVerificationSession(
          sessionDirectory.current
        )
      ) {
        throw new Error(
          "Unable to clean previous session."
        );
      }

      sessionDirectory.current =
        createVerificationSession();

      setStorageError(false);
      setStorageReady(true);
    } catch (error) {
      console.error("STORAGE RETRY FAILED:", error);

      Alert.alert(
        "Storage Error",
        "Unable to prepare temporary storage."
      );
    }
  };

  /* ---------- CAMERA PERMISSION ---------- */

  const handlePermission = async () => {
    try {
      if (permission && !permission.canAskAgain) {
        await Linking.openSettings();
        return;
      }

      const result = await requestPermission();

      console.log(
        "CAMERA PERMISSION:",
        result.granted
      );

      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Camera access is required to capture your photos."
        );
      }
    } catch (error) {
      console.error("PERMISSION ERROR:", error);
    }
  };

  /* ---------- CAMERA CAPTURE ---------- */

  const capturePhoto = async () => {
    if (
      !cameraRef.current ||
      !cameraReady ||
      captureLock.current ||
      !sessionDirectory.current ||
      step === "complete"
    ) {
      return;
    }

    const currentStep = step;
    const directory = sessionDirectory.current;

    let originalUri: string | null = null;
    let storedUri: string | null = null;

    captureLock.current = true;
    setIsCapturing(true);

    console.log("CAPTURE REQUEST:", currentStep);

    try {
      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });

      if (!photo?.uri) {
        throw new Error("No image file returned.");
      }

      originalUri = photo.uri;

      // The screen may have been closed while
      // the native camera was capturing.
      if (
        !isMounted.current ||
        sessionDirectory.current !== directory
      ) {
        deleteVerificationPhoto(originalUri);
        return;
      }

      // Move the camera-generated image into
      // our dedicated verification directory.
      storedUri = storeVerificationPhoto(
        originalUri,
        directory,
        currentStep
      );

      console.log("CAPTURE SUCCESS:", currentStep);

      setCameraReady(false);

      setPreview({
        ...photo,
        uri: storedUri,
      });
    } catch (error) {
      console.error(
        "CAPTURE ERROR:",
        currentStep,
        error
      );

      // Clean up incomplete captures.
      deleteVerificationPhoto(originalUri);
      deleteVerificationPhoto(storedUri);

      if (isMounted.current) {
        Alert.alert(
          "Capture Failed",
          "Unable to capture or save the photo. Please try again."
        );
      }
    } finally {
      captureLock.current = false;

      if (isMounted.current) {
        setIsCapturing(false);
      }
    }
  };

  /* ---------- ACCEPT CAPTURED PHOTO ---------- */

  const confirmPhoto = () => {
    if (!preview || step === "complete") {
      return;
    }

    const file: CapturedFile = {
      uri: preview.uri,

      name:
        step === "id"
          ? "student-id.jpg"
          : "selfie.jpg",

      type: "image/jpeg",
      width: preview.width,
      height: preview.height,
    };

    if (step === "id") {
      setIdFile(file);

      if (__DEV__) {
        console.log(
          "STUDENT ID FILE:",
          JSON.stringify(file, null, 2)
        );
      }

      setPreview(null);
      setCameraReady(false);
      setCameraError(null);
      setStep("selfie");

      console.log("ID STEP COMPLETED");
      console.log("NEXT STEP: SELFIE");

      return;
    }

    if (!idFile) {
      Alert.alert(
        "Missing Student ID",
        "Please capture your student ID again."
      );

      restartVerification();
      return;
    }

    setSelfieFile(file);

    if (__DEV__) {
      console.log(
        "SELFIE FILE:",
        JSON.stringify(file, null, 2)
      );

      console.log(
        "VERIFICATION OUTPUT:",
        JSON.stringify(
          {
            studentId: idFile,
            selfie: file,
          },
          null,
          2
        )
      );
    }

    console.log("SELFIE STEP COMPLETED");
    console.log("BOTH IMAGE FILES READY");

    setPreview(null);
    setCameraReady(false);
    setStep("complete");
  };

  /* ---------- RETAKE PHOTO ---------- */

  const retakePhoto = () => {
    console.log("RETAKE PHOTO:", step);

    // Delete the rejected photo before retaking.
    const deleted = deleteVerificationPhoto(
      preview?.uri
    );

    if (!deleted) {
      Alert.alert(
        "Cleanup Failed",
        "Unable to remove the previous photo. Please try again."
      );

      return;
    }

    setPreview(null);
    setCameraReady(false);
    setCameraError(null);

    setCameraSession(
      (current) => current + 1
    );
  };

  /* ---------- RESTART VERIFICATION ---------- */

  const restartVerification = () => {
    if (
      !clearVerificationSession(
        sessionDirectory.current
      )
    ) {
      Alert.alert(
        "Cleanup Failed",
        "Unable to remove previous verification files."
      );

      return;
    }

    sessionDirectory.current = null;

    setIdFile(null);
    setSelfieFile(null);
    setPreview(null);
    setCameraReady(false);
    setCameraError(null);
    setStep("id");

    try {
      sessionDirectory.current =
        createVerificationSession();

      setStorageReady(true);
      setStorageError(false);

      console.log("VERIFICATION RESTARTED");
    } catch (error) {
      console.error(
        "SESSION RESTART FAILED:",
        error
      );

      setStorageReady(false);
      setStorageError(true);
    }

    setCameraSession(
      (current) => current + 1
    );
  };

  /* ---------- EXIT VERIFICATION ---------- */

  const exitVerification = () => {
    if (isCapturing) {
      return;
    }

    // Leaving the screen discards temporary files.
    if (
      !clearVerificationSession(
        sessionDirectory.current
      )
    ) {
      Alert.alert(
        "Cleanup Failed",
        "Unable to remove temporary photos. Please try again."
      );

      return;
    }

    sessionDirectory.current = null;

    console.log("VERIFICATION CLOSED");

    router.back();
  };

  const handleBack = () => {
    if (isCapturing) {
      return;
    }

    if (step === "complete") {
      exitVerification();
      return;
    }

    if (!preview && !idFile && !selfieFile) {
      exitVerification();
      return;
    }

    Alert.alert(
      "Cancel Verification?",
      "Your captured photos will be deleted.",
      [
        {
          text: "Continue",
          style: "cancel",
        },
        {
          text: "Discard Photos",
          style: "destructive",
          onPress: exitVerification,
        },
      ]
    );
  };

  /* ---------- CURRENT STEP ---------- */

  const stepNumber =
    step === "id" ? 1 : step === "selfie" ? 2 : 3;

  /* ---------- HEADER ---------- */

  const renderHeader = () => (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 16 },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        disabled={isCapturing}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons
          name="chevron-back"
          size={26}
          color={colors.textGreenBg}
        />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>
        ID Verification
      </Text>
    </View>
  );

  /* ---------- PROGRESS INDICATOR ---------- */

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        Step {stepNumber} of 3
      </Text>

      <View style={styles.progressRow}>
        {[1, 2, 3].map((number) => (
          <View
            key={number}
            style={[
              styles.progressBar,
              number <= stepNumber &&
                styles.progressActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  /* ---------- WEB FALLBACK ---------- */

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.centerContent}>
          <Ionicons
            name="phone-portrait-outline"
            size={64}
            color={colors.primary}
          />

          <Text style={styles.title}>
            Mobile Device Required
          </Text>

          <Text style={styles.description}>
            Please use the mobile application
            to capture your student ID and selfie.
          </Text>
        </View>
      </View>
    );
  }

  /* ---------- STORAGE ERROR ---------- */

  if (storageError) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.centerContent}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />

          <Text style={styles.title}>
            Storage Error
          </Text>

          <Text style={styles.description}>
            Unable to prepare temporary storage
            for your verification photos.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={retryStorage}
          >
            <Text style={styles.primaryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------- STORAGE LOADING ---------- */

  if (!storageReady) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.centerContent}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.description}>
            Preparing verification...
          </Text>
        </View>
      </View>
    );
  }

  /* ---------- COMPLETION SCREEN ---------- */

  if (step === "complete") {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderProgress()}

        <View style={styles.centerContent}>
          <View style={styles.successCircle}>
            <Ionicons
              name="checkmark"
              size={90}
              color={colors.primary}
            />
          </View>

          <Text style={styles.successTitle}>
            Thank you!
          </Text>

          <Text style={styles.description}>
            Your student ID and selfie have been
            captured successfully.
          </Text>

          <View style={styles.successDetails}>
            <View style={styles.successRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />

              <Text style={styles.successText}>
                Student ID captured
              </Text>
            </View>

            <View style={styles.successRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primary}
              />

              <Text style={styles.successText}>
                Selfie captured
              </Text>
            </View>
          </View>

          <Text style={styles.note}>
            {idFile && selfieFile
              ? "Both photos are ready for testing. Temporary photos will be deleted when you leave this screen."
              : "Image files are unavailable."}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={exitVerification}
          >
            <Text style={styles.primaryButtonText}>
              Done
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={restartVerification}
          >
            <Text style={styles.secondaryButtonText}>
              Start Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------- PERMISSION LOADING ---------- */

  if (!permission) {
    return (
      <View style={styles.container}>
        {renderHeader()}

        <View style={styles.centerContent}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.description}>
            Checking camera permission...
          </Text>
        </View>
      </View>
    );
  }

  /* ---------- REQUEST PERMISSION ---------- */

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderProgress()}

        <View style={styles.centerContent}>
          <Ionicons
            name="camera-outline"
            size={72}
            color={colors.primary}
          />

          <Text style={styles.title}>
            Camera Permission
          </Text>

          <Text style={styles.description}>
            Allow camera access to capture your
            student ID and selfie.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePermission}
          >
            <Text style={styles.primaryButtonText}>
              {permission.canAskAgain
                ? "Allow Camera Access"
                : "Open Settings"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------- PHOTO REVIEW SCREEN ---------- */

  if (preview) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderProgress()}

        <View
          style={[
            styles.reviewContent,
            {
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <Text style={styles.title}>
            {step === "id"
              ? "Review your Student ID"
              : "Review your Selfie"}
          </Text>

          <Text style={styles.description}>
            Make sure your photo is clear
            before continuing.
          </Text>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: preview.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={confirmPhoto}
          >
            <Text style={styles.primaryButtonText}>
              {step === "id"
                ? "Confirm ID & Continue"
                : "Confirm Selfie"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={retakePhoto}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.secondaryButtonText}>
              Retake Photo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------- LIVE CAMERA SCREEN ---------- */

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderProgress()}

      <View style={styles.cameraInstructions}>
        <Text style={styles.title}>
          {step === "id"
            ? "Capture Student ID"
            : "Take a Selfie"}
        </Text>

        <Text style={styles.description}>
          {step === "id"
            ? "Hold your student ID vertically inside the frame and move a little closer."
            : "Position your face inside the oval."}
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        {!cameraError && (
          <CameraView
            key={`${step}-${cameraSession}`}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={step === "id" ? "back" : "front"}
            mode="picture"
            mirror={step === "selfie"}
            onCameraReady={() => {
              console.log("CAMERA READY:", step);
              setCameraReady(true);
            }}
            onMountError={(error) => {
              console.error(
                "CAMERA MOUNT ERROR:",
                step,
                error.message
              );

              setCameraReady(false);
              setCameraError(error.message);
            }}
          />
        )}

        {/* ---------- ALIGNMENT GUIDE ---------- */}

        {!cameraError && (
          <View
            pointerEvents="none"
            style={styles.cameraOverlay}
          >
            {step === "id" ? (
              <View style={styles.idFrame}>
                <View
                  style={[
                    styles.corner,
                    styles.topLeft,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.topRight,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.bottomLeft,
                  ]}
                />

                <View
                  style={[
                    styles.corner,
                    styles.bottomRight,
                  ]}
                />
              </View>
            ) : (
              <View style={styles.selfieFrame} />
            )}

            <Text style={styles.overlayText}>
              {step === "id"
                ? "Keep all four corners visible"
                : "Look directly at the camera"}
            </Text>
          </View>
        )}

        {/* ---------- CAMERA LOADING ---------- */}

        {!cameraReady && !cameraError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="large"
              color="#FFFFFF"
            />

            <Text style={styles.overlayText}>
              Starting camera...
            </Text>
          </View>
        )}

        {/* ---------- CAMERA ERROR ---------- */}

        {cameraError && (
          <View style={styles.loadingOverlay}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color="#FFFFFF"
            />

            <Text style={styles.overlayText}>
              Unable to start camera.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setCameraReady(false);
                setCameraError(null);

                setCameraSession(
                  (current) => current + 1
                );
              }}
            >
              <Text style={styles.primaryButtonText}>
                Retry Camera
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ---------- CAPTURE BUTTON ---------- */}

      <View
        style={[
          styles.captureControls,
          {
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.shutterButton,
            (!cameraReady || isCapturing) &&
              styles.disabled,
          ]}
          onPress={capturePhoto}
          disabled={!cameraReady || isCapturing}
          accessibilityRole="button"
          accessibilityLabel={
            step === "id"
              ? "Capture Student ID"
              : "Capture Selfie"
          }
        >
          {isCapturing ? (
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </TouchableOpacity>

        <Text style={styles.captureLabel}>
          {isCapturing
            ? "Capturing..."
            : step === "id"
              ? "Capture Student ID"
              : "Capture Selfie"}
        </Text>
      </View>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  backButton: {
    marginRight: 8,
  },

  headerTitle: {
    color: colors.textGreenBg,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 1,
  },

  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },

  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },

  progressRow: {
    flexDirection: "row",
    gap: 8,
  },

  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 10,
    backgroundColor: colors.border,
  },

  progressActive: {
    backgroundColor: colors.primary,
  },

  cameraInstructions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  title: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },

  cameraContainer: {
    flex: 1,
    minHeight: 220,
    backgroundColor: "#111111",
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ---------- PORTRAIT ID FRAME ---------- */

  idFrame: {
    width: "58%",
    maxWidth: 220,
    aspectRatio: 7 / 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
  },

  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },

  topRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },

  bottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },

  bottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },

  selfieFrame: {
    width: "65%",
    maxWidth: 240,
    aspectRatio: 0.78,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
    borderRadius: 200,
  },

  overlayText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },

  captureControls: {
    alignItems: "center",
    paddingTop: 20,
  },

  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
  },

  disabled: {
    opacity: 0.4,
  },

  captureLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 30,
    gap: 12,
  },

  reviewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  imageContainer: {
    flex: 1,
    minHeight: 180,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 20,
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  primaryButton: {
    minHeight: 50,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  primaryButtonText: {
    color: colors.textGreenBg,
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 48,
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    marginTop: 12,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  successTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },

  successDetails: {
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    gap: 14,
  },

  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  successText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  note: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
  },
});
