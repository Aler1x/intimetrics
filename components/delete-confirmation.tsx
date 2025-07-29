import { X } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { DefaultTheme } from "~/lib/theme";
import { BottomModal } from "./ui/modal";
import { Text } from "./ui/text";
import { Button } from "./ui/button";

export interface DeleteConfirmationProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  deleteText?: string;
  cancelText?: string;
  subMessage?: string;
}

export default function DeleteConfirmation({
  visible,
  onClose,
  onDelete,
  onCancel,
  title,
  message,
  deleteText = 'Delete',
  cancelText = 'Cancel',
  subMessage,
}: DeleteConfirmationProps) {
  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      className="gap-4">
        <View className="flex-row items-center justify-between p-2">
          <Text className="text-lg font-semibold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={DefaultTheme.colors.foreground} />
          </TouchableOpacity>
        </View>

        <View className="px-2">
          <Text className="mb-2 text-base">{message}</Text>
          {subMessage && <Text className="text-sm text-gray-600">{subMessage}</Text>}
        </View>

        <View className="w-full flex-row items-center gap-2">
          <Button
            variant="outline"
            className="w-[50%]"
            onPress={onCancel}>
            <Text className="font-medium">{cancelText}</Text>
          </Button>
          <Button
            variant="default"
            className="w-[50%] bg-red-500"
            onPress={onDelete}
            style={{ backgroundColor: '#ef4444' }}>
            <Text className="font-medium text-white">{deleteText}</Text>
          </Button>
        </View>
    </BottomModal>
  );
} 