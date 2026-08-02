import AsyncStorage from "@react-native-async-storage/async-storage";

const LAUNCHED_BEFORE_KEY = "subly.hasLaunchedBefore";

export const getHasLaunchedBefore = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(LAUNCHED_BEFORE_KEY);
    return value === "true";
  } catch (error) {
    console.warn("Failed to read launch flag:", error);
    return false;
  }
};

export const setHasLaunchedBefore = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAUNCHED_BEFORE_KEY, "true");
  } catch (error) {
    console.warn("Failed to persist launch flag:", error);
  }
};
