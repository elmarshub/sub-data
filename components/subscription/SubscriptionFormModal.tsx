import { CATEGORIES, CATEGORY_COLORS } from "@/constants/categories";
import { colors } from "@/constants/theme";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import {
  SubscriptionFormValues,
  subscriptionFormSchema,
} from "@/schemas/subscription";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
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

interface SubscriptionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
  /** when provided, the modal edits this subscription instead of creating a new one. */
  initialValues?: Subscription;
}

const DEFAULT_VALUES: SubscriptionFormValues = {
  name: "",
  price: "",
  billing: "Monthly",
  category: null,
};

const SubscriptionFormModal = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: SubscriptionFormModalProps) => {
  const isEditMode = Boolean(initialValues);
  const scrollRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // re-sync every time the modal opens, either prefilling from the
  // subscription being edited or resetting to a blank create form.
  useEffect(() => {
    if (!visible) return;
    reset(
      initialValues
        ? {
            name: initialValues.name,
            price: String(initialValues.price),
            billing: initialValues.billing === "Yearly" ? "Yearly" : "Monthly",
            category:
              (initialValues.category as SubscriptionFormValues["category"]) ??
              null,
          }
        : DEFAULT_VALUES,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues?.id]);

  const handleClose = () => onClose();

  const onValid = (data: SubscriptionFormValues) => {
    const resolvedCategory = data.category ?? "Other";
    const price = Number(data.price);

    if (isEditMode && initialValues) {
      const updated: Subscription = {
        ...initialValues,
        name: data.name,
        price,
        billing: data.billing,
        category: resolvedCategory,
        color: CATEGORY_COLORS[resolvedCategory],
      };

      posthog.capture("subscription_updated", {
        subscription_id: updated.id,
        category: resolvedCategory,
        billing: updated.billing,
        price: updated.price,
      });

      onSubmit(updated);
      return;
    }

    const now = dayjs();
    const renewal =
      data.billing === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const created: Subscription = {
      id: `custom-${Date.now()}`,
      iconKey: "plus",
      name: data.name,
      price,
      currency: "USD",
      billing: data.billing,
      category: resolvedCategory,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      color: CATEGORY_COLORS[resolvedCategory],
    };

    posthog.capture("subscription_created", {
      subscription_id: created.id,
      category: resolvedCategory,
      billing: created.billing,
      price: created.price,
    });

    onSubmit(created);
  };

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
            <Text className="modal-title">
              {isEditMode ? "Edit Subscription" : "New Subscription"}
            </Text>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close subscription form"
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
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.name && "auth-input-error",
                      )}
                      value={value}
                      onChangeText={onChange}
                      placeholder="e.g. Netflix"
                      placeholderTextColor={colors.mutedForeground}
                      autoCapitalize="words"
                      onFocus={() =>
                        scrollRef.current?.scrollTo({ y: 0, animated: true })
                      }
                    />
                  )}
                />
                {errors.name ? (
                  <Text className="auth-error">{errors.name.message}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors.price && "auth-input-error",
                      )}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.00"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="decimal-pad"
                      onFocus={() =>
                        scrollRef.current?.scrollTo({ y: 80, animated: true })
                      }
                    />
                  )}
                />
                {errors.price ? (
                  <Text className="auth-error">{errors.price.message}</Text>
                ) : null}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <Controller
                  control={control}
                  name="billing"
                  render={({ field: { value, onChange } }) => (
                    <View className="picker-row">
                      {(["Monthly", "Yearly"] as const).map((freq) => (
                        <Pressable
                          key={freq}
                          className={clsx(
                            "picker-option",
                            value === freq && "picker-option-active",
                          )}
                          onPress={() => onChange(freq)}
                        >
                          <Text
                            className={clsx(
                              "picker-option-text",
                              value === freq && "picker-option-text-active",
                            )}
                          >
                            {freq}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { value, onChange } }) => (
                    <View className="category-scroll">
                      {CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat}
                          className={clsx(
                            "category-chip",
                            value === cat && "category-chip-active",
                          )}
                          onPress={() => onChange(cat)}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              value === cat && "category-chip-text-active",
                            )}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>

              <Pressable className="auth-button" onPress={handleSubmit(onValid)}>
                <Text className="auth-button-text">
                  {isEditMode ? "Save Changes" : "Create Subscription"}
                </Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SubscriptionFormModal;
