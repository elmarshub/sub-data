import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface AuthFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

const AuthField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
}: AuthFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className="relative">
        <TextInput
          className={`auth-input ${error ? "auth-input-error" : ""}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-0 bottom-0 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-sans-semibold text-muted-foreground">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        )}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
};

export default AuthField;
