import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

interface BackButtonProps {
  onPress: () => void;
}

const BackButton = ({ onPress }: BackButtonProps) => (
  <Pressable
    onPress={onPress}
    className="detail-back-button"
    accessibilityRole="button"
    accessibilityLabel="Go back"
  >
    <Ionicons name="chevron-back" size={20} color={colors.primary} />
  </Pressable>
);

export default BackButton;
