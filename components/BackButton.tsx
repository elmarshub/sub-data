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
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    accessibilityRole="button"
    accessibilityLabel="Go back"
  >
    <Ionicons name="chevron-back" size={20} color={colors.primary} />
  </Pressable>
);

export default BackButton;
