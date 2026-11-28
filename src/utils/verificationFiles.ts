
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

let initialized = false;
let sessionCounter = 0;

/* ---------- VERIFICATION CACHE ---------- */

function getVerificationDirectory() {
  return new Directory(
    Paths.cache,
    "student-verification"
  );
}

/* ---------- STARTUP CLEANUP ---------- */

export function initializeVerificationStorage() {
  if (Platform.OS === "web" || initialized) {
    return;
  }

  const directory = getVerificationDirectory();

  if (directory.exists) {
    directory.delete();

    console.log(
      "ABANDONED VERIFICATION FILES CLEANED"
    );
  }

  directory.create({
    intermediates: true,
    idempotent: true,
  });

  initialized = true;
}

/* ---------- CREATE NEW SESSION ---------- */

export function createVerificationSession() {
  initializeVerificationStorage();

  sessionCounter += 1;

  const directory = new Directory(
    getVerificationDirectory(),
    `session-${Date.now()}-${sessionCounter}`
  );

  directory.create({
    intermediates: true,
    idempotent: true,
  });

  console.log("VERIFICATION SESSION CREATED");

  return directory;
}

/* ---------- SAVE CAPTURED PHOTO ---------- */

export function storeVerificationPhoto(
  sourceUri: string,
  directory: Directory,
  type: "id" | "selfie"
) {
  const source = new File(sourceUri);

  const destination = new File(
    directory,
    type === "id"
      ? "student-id.jpg"
      : "selfie.jpg"
  );

  if (!source.exists) {
    throw new Error("Captured photo does not exist.");
  }

  directory.create({
    intermediates: true,
    idempotent: true,
  });

  if (destination.exists) {
    destination.delete();
  }

  // Move instead of copying to avoid duplicate files.
  source.moveSync(destination);

  if (!destination.exists) {
    throw new Error("Unable to store captured photo.");
  }

  console.log("VERIFICATION PHOTO STORED:", type);

  return destination.uri;
}

/* ---------- DELETE SINGLE PHOTO ---------- */

export function deleteVerificationPhoto(
  uri?: string | null
): boolean {
  if (!uri || Platform.OS === "web") {
    return true;
  }

  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }

    if (file.exists) {
      return false;
    }

    console.log("TEMPORARY PHOTO DELETED");

    return true;
  } catch (error) {
    console.error("PHOTO CLEANUP FAILED:", error);
    return false;
  }
}

/* ---------- DELETE SESSION ---------- */

export function clearVerificationSession(
  directory: Directory | null
): boolean {
  if (!directory || Platform.OS === "web") {
    return true;
  }

  try {
    if (directory.exists) {
      directory.delete();
    }

    if (directory.exists) {
      return false;
    }

    console.log("VERIFICATION SESSION CLEANED");

    return true;
  } catch (error) {
    console.error("SESSION CLEANUP FAILED:", error);
    return false;
  }
}
