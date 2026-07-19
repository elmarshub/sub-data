import { icons } from "@/constants/icons";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f6eecf",
  Cloud: "#d4e8f5",
  Music: "#f5d4e8",
  Other: "#e8e8e8",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const scrollRef = useRef<ScrollView>(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const parsedPrice = Number(price);
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "Enter a valid price";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = dayjs();
    const renewal =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const subscription: Subscription = {
      id: `custom-${Date.now()}`,
      icon: icons.plus,
      name: name.trim(),
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      category: category ?? "Other",
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      color: CATEGORY_COLORS[category ?? "Other"],
    };

    const resolvedCategory = category ?? "Other";

    posthog.capture("subscription_created", {
      subscription_id: subscription.id,
      category: resolvedCategory,
      billing: subscription.billing,
      price: subscription.price,
    });

    onCreate(subscription);
    resetForm();
  };

  const isValid = name.trim() && Number(price) > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="modal-overlay" onPress={handleClose}>
        <Pressable
          className="modal-container"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close new subscription modal"
            >
              <Text className="modal-close-text">&times;</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              ref={scrollRef}
              className="modal-body"
              contentContainerClassName="pb-16"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.name && "auth-input-error",
                  )}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  autoCapitalize="words"
                  onFocus={() =>
                    scrollRef.current?.scrollTo({ y: 0, animated: true })
                  }
                />
                {errors.name ? (
                  <Text className="auth-error">{errors.name}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.price && "auth-input-error",
                  )}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  keyboardType="decimal-pad"
                  onFocus={() =>
                    scrollRef.current?.scrollTo({ y: 80, animated: true })
                  }
                />
                {errors.price ? (
                  <Text className="auth-error">{errors.price}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((freq) => (
                    <Pressable
                      key={freq}
                      className={clsx(
                        "picker-option",
                        frequency === freq && "picker-option-active",
                      )}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === freq && "picker-option-text-active",
                        )}
                      >
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CreateSubscriptionModal;
