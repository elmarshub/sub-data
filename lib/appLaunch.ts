import AsyncStorage from "@react-native-async-storage/async-storage";

const LAUNCHED_BEFORE_KEY = "subly.hasLaunchedBefore";

export const getHasLaunchedBefore = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(LAUNCHED_BEFORE_KEY);
  return value === "true";
};

export const setHasLaunchedBefore = async (): Promise<void> => {
  await AsyncStorage.setItem(LAUNCHED_BEFORE_KEY, "true");
};
