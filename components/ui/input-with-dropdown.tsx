import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Text } from '~/components/ui/text';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { DefaultTheme } from '~/lib/theme';

const DEFAULT_DATA: SelectListData[] = [];

export type SelectListData = {
  id: string;
  value: string;
  disabled?: boolean;
};

export interface SelectListProps {
  setSelected: (value: any) => void;
  placeholder?: string;
  boxStyles?: ViewStyle;
  inputStyles?: TextStyle;
  dropdownStyles?: ViewStyle;
  dropdownItemStyles?: ViewStyle;
  dropdownTextStyles?: TextStyle;
  maxHeight?: number;
  data?: SelectListData[];
  defaultOption?: { id: any; value: any };
  search?: boolean;
  searchPlaceholder?: string;
  onSelect?: () => void;
  fontFamily?: string;
  notFoundText?: string;
  disabledItemStyles?: ViewStyle;
  disabledTextStyles?: TextStyle;
  value?: SelectListData | string;
  dropdownShown?: boolean;
  allowFreeText?: boolean;
  closeOnSelect?: boolean;
  triggerKeyboard?: boolean;
}

const InputWithDropdown: React.FC<SelectListProps> = ({
  setSelected,
  placeholder,
  boxStyles,
  inputStyles,
  dropdownStyles,
  dropdownItemStyles,
  dropdownTextStyles,
  maxHeight,
  data = DEFAULT_DATA,
  defaultOption,
  search = true,
  searchPlaceholder = 'Search',
  notFoundText = 'No data found',
  disabledItemStyles,
  disabledTextStyles,
  onSelect = () => { },
  value,
  dropdownShown = false,
  fontFamily,
  allowFreeText = false,
  closeOnSelect = true,
  triggerKeyboard = true,
}) => {
  const oldOption = React.useRef(null);
  const textInputRef = React.useRef<TextInput>(null);
  const [_firstRender, _setFirstRender] = React.useState<boolean>(true);
  const [dropdown, setDropdown] = React.useState<boolean>(dropdownShown);
  const [selectedVal, setSelectedVal] = React.useState<any>('');
  const [height, setHeight] = React.useState<number>(200);
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [filteredData, setFilteredData] = React.useState<SelectListData[]>(data);
  const [searchQuery, setSearchQuery] = React.useState<string>('');


  const slidedown = React.useCallback(() => {
    setDropdown(true);
    Animated.timing(animatedValue, {
      toValue: height,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      // Focus the text input after animation completes
      if (triggerKeyboard) {
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 100);
      }
    });
  }, [height, animatedValue, triggerKeyboard]);

  const slideup = React.useCallback(() => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start(() => setDropdown(false));
  }, [animatedValue]);

  React.useEffect(() => {
    if (maxHeight) setHeight(maxHeight);
  }, [maxHeight]);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  React.useEffect(() => {
    if (_firstRender) {
      _setFirstRender(false);
      return;
    }
    onSelect();
  }, [selectedVal]);

  React.useEffect(() => {
    if (!_firstRender && defaultOption && oldOption.current != defaultOption.id) {
      oldOption.current = defaultOption.id;
      setSelected(defaultOption.id);
      setSelectedVal(defaultOption.value);
    }
    if (defaultOption && _firstRender && defaultOption.id != undefined) {
      oldOption.current = defaultOption.id;
      setSelected(defaultOption.id);
      setSelectedVal(defaultOption.value);
    }
  }, [defaultOption]);

  React.useEffect(() => {
    if (!_firstRender) {
      if (dropdownShown) slidedown();
      else slideup();
    }
  }, [dropdownShown]);

  // Handle search input changes with filtering
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (allowFreeText) {
      setSelected({
        id: query,
        value: query,
      });
    } else {
      // Filter the data based on search query
      const result = data.filter((item: SelectListData) => {
        const searchValue = query.toLowerCase();
        const itemValue = item.value?.toString().toLowerCase() || '';
        return itemValue.search(searchValue) > -1;
      });
      setFilteredData(result);
    }
  };

  const getText = () => {
    if (value) {
      return value;
    }

    if (selectedVal !== '') {
      return selectedVal;
    }
    if (searchQuery !== '') {
      return searchQuery;
    }
    return placeholder ? placeholder : 'Select option';
  };

  return (
    <View>
      {dropdown && search ? (
        <View style={[styles.wrapper, boxStyles]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Search size={20} color={DefaultTheme.colors.primary} style={{ marginRight: 10 }} />

            <TextInput
              ref={textInputRef}
              placeholder={searchPlaceholder}
              placeholderTextColor={DefaultTheme.colors.mutedForeground}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onBlur={(e) => {
                // Delay slideup to allow dropdown item selection
                setTimeout(() => {
                  slideup();
                }, 150);
              }}
              style={
                [
                  {
                    padding: 0,
                    height: 20,
                    flex: 1,
                    fontFamily,
                    color: DefaultTheme.colors.foreground,
                  },
                  inputStyles,
                ]
              }
            />
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setFilteredData(data);
                slideup();
              }}>
              <X size={20} color={DefaultTheme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.wrapper, boxStyles]}
          onPress={() => {
            if (!dropdown) {
              slidedown();
            } else {
              slideup();
            }
          }}>
          <Text style={[{ fontFamily }, inputStyles]}>{getText()}</Text>
          <ChevronDown size={20} color={DefaultTheme.colors.primary} />
        </TouchableOpacity>
      )}

      {dropdown ? (
        <Animated.View style={[{ maxHeight: animatedValue }, styles.dropdown, dropdownStyles]}>
          <ScrollView
            contentContainerStyle={{ paddingVertical: 10, overflow: 'hidden' }}
            keyboardDismissMode='none'
            keyboardShouldPersistTaps='always'
            nestedScrollEnabled={true}>
            {filteredData.length >= 1 ? (
              filteredData.map((item: SelectListData, index: number) => {
                let value = item.value;
                let disabled = item.disabled ?? false;
                if (disabled) {
                  return (
                    <TouchableOpacity
                      style={[styles.disabledoption, disabledItemStyles]}
                      key={item.id || index}
                      onPress={() => { }}>
                      <Text style={[{ color: '#c4c5c6', fontFamily }, disabledTextStyles]}>{value}</Text>
                    </TouchableOpacity>
                  );
                } else {
                  return (
                    <TouchableOpacity
                      style={[styles.option, dropdownItemStyles]}
                      key={item.id || index}
                      onPress={() => {
                        setSelected(item);
                        setSelectedVal(value);
                        if (closeOnSelect) slideup();
                        setSearchQuery('');
                        setTimeout(() => {
                          setFilteredData(data);
                        }, 800);
                      }}>
                      <Text style={[{ fontFamily }, dropdownTextStyles]}>{value}</Text>
                    </TouchableOpacity>
                  );
                }
              })
            ) : (
              <TouchableOpacity
                style={[styles.option, dropdownItemStyles]}
                onPress={() => {
                  setSelected(undefined);
                  setSelectedVal('');
                  if (closeOnSelect) slideup();
                  setSearchQuery('');
                  setTimeout(() => setFilteredData(data), 800);
                }}>
                <Text style={[{ fontFamily }, dropdownTextStyles]}>{notFoundText}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      ) : null}
    </View>
  );
};

export default InputWithDropdown;

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: DefaultTheme.colors.input,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: DefaultTheme.colors.input,
    marginTop: 5,
    overflow: 'hidden'
  },
  option: { paddingHorizontal: 20, paddingVertical: 8, overflow: 'hidden' },
  disabledoption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'whitesmoke',
    opacity: 0.9,
  },
});
