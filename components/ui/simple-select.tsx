import React, { useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from './text';
import { ChevronDown } from '~/lib/icons/ChevronDown';
import { SelectListData } from './input-with-dropdown';

interface SimpleSelectProps {
  placeholder: string;
  value: SelectListData | null;
  setSelected: (value: SelectListData | null) => void;
  data: SelectListData[];
}

export default function SimpleSelect({ placeholder, value, setSelected, data }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="native:h-12 flex h-10 flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2">
        <Text className="text-sm text-foreground">{value?.value || placeholder}</Text>
        <ChevronDown size={16} className="text-foreground opacity-50" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setIsOpen(false)}>
          <View className="max-h-96 w-80 rounded-lg bg-card p-4">
            <Text className="mb-4 text-lg font-semibold">{placeholder}</Text>
            {data.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelected(item);
                  setIsOpen(false);
                }}
                className="border-b border-border py-3">
                <Text className="text-sm text-foreground">{item.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
