import { colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface SubscriptionActionsProps {
  status?: string;
  onEdit: () => void;
  onTogglePause: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

const SubscriptionActions = ({
  status,
  onEdit,
  onTogglePause,
  onCancel,
  onDelete,
}: SubscriptionActionsProps) => {
  const isPaused = status === "paused";
  const isCancelled = status === "cancelled";

  return (
    <View className="detail-actions">
      {!isCancelled ? (
        <Pressable
          className="detail-action-secondary"
          onPress={onTogglePause}
          accessibilityRole="button"
          accessibilityLabel={
            isPaused ? "Resume subscription" : "Pause subscription"
          }
        >
          <Text className="detail-action-secondary-text">
            {isPaused ? "Resume Subscription" : "Pause Subscription"}
          </Text>
        </Pressable>
      ) : null}

      <View className="detail-icon-actions-row">
        <Pressable
          className="detail-icon-action"
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit subscription"
        >
          <View className="detail-icon-action-circle detail-icon-action-circle-edit">
            <Ionicons name="create-outline" size={22} color={colors.accent} />
          </View>
          <Text className="detail-icon-action-label">Edit</Text>
        </Pressable>

        {!isCancelled ? (
          <Pressable
            className="detail-icon-action"
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel subscription"
          >
            <View className="detail-icon-action-circle detail-icon-action-circle-neutral">
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <Text className="detail-icon-action-label">Cancel</Text>
          </Pressable>
        ) : null}

        <Pressable
          className="detail-icon-action"
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete subscription"
        >
          <View className="detail-icon-action-circle detail-icon-action-circle-danger">
            <Ionicons name="trash-outline" size={22} color={colors.destructive} />
          </View>
          <Text className="detail-icon-action-label">Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SubscriptionActions;
