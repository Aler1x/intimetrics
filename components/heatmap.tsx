import { ActivityIndicator, ScrollView, View, TouchableOpacity } from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useActivityStore } from '~/store/activity-store';
import type { ActivityType } from '~/types';
import { Text } from './ui/text';
import { DefaultTheme } from '~/lib/theme';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { ChevronRight } from '~/lib/icons/ChevronRight';

interface HeatmapProps {
  year?: number;
  month?: number; // Add month prop
  period?: 'week' | 'month' | 'year';
  filterType?: ActivityType | null;
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

function getWeeksInYear(year: number): Date[][] {
  const days = getDaysInYear(year);
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add padding days to start the year on Sunday
  const firstDay = days[0];
  const dayOfWeek = firstDay.getDay();
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push(new Date(firstDay.getTime() - (dayOfWeek - i) * 24 * 60 * 60 * 1000));
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days if any
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const lastDay = currentWeek[currentWeek.length - 1];
      currentWeek.push(new Date(lastDay.getTime() + 24 * 60 * 60 * 1000));
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getIntensityColor(count: number): string {
  if (count === 0) return '#f0f0f0';
  if (count === 1) return '#d4b8a3';
  if (count === 2) return '#c39e88';
  if (count === 3) return '#a67c5a';
  if (count === 4) return '#8b5a3c';
  return '#6e4229';
}

function getCurrentWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }

  return days;
}

function getMonthDays(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);

  // Start from Monday of the week containing the first day
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday to be 0, so we subtract 1 and handle Sunday specially
  let daysToSubtract = firstDay.getDay() - 1;
  if (daysToSubtract < 0) daysToSubtract = 6; // Sunday becomes 6 days back
  startDate.setDate(firstDay.getDate() - daysToSubtract);

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  while (startDate <= lastDay || currentWeek.length > 0) {
    currentWeek.push(new Date(startDate));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    startDate.setDate(startDate.getDate() + 1);

    // Stop when we've filled a complete week past the last day
    if (startDate > lastDay && currentWeek.length === 0) break;
  }

  // Complete the last week if needed
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export default function Heatmap({
  year = new Date().getFullYear(),
  month = new Date().getMonth(), // Add month prop with default
  period = 'year',
  filterType = null,
}: HeatmapProps) {
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Internal state for month navigation
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);
  
  // Internal state for week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay);
    return weekStart;
  });

  const { getActivityCountsByDate, getActivitiesByType, addUpdateHook } = useActivityStore();

  const navigateToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const navigateToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const navigateToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const navigateToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const navigateToPreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const navigateToNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (filterType) {
        // Get activities by type and count them by date
        const activities = await getActivitiesByType(filterType);
        const counts: Record<string, number> = {};

        activities.forEach((activity) => {
          const dateStr = activity.date;
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });

        setActivityCounts(counts);
      } else {
        // Get all activities by date
        const counts = await getActivityCountsByDate();
        setActivityCounts(counts);
      }
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setLoading(false);
    }
  }, [getActivityCountsByDate, getActivitiesByType, filterType]);

  // Sync internal state with props
  useEffect(() => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, [year, month]);

  useEffect(() => {
    addUpdateHook('heatmap', loadData);
  }, [addUpdateHook, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData, period, currentMonth, currentYear, currentWeekStart]);

  if (loading) {
    return (
      <View className="rounded-lg bg-card p-4 shadow-sm">
        <Text className="mb-4 text-lg font-bold">Activity Heatmap</Text>
        <View className="h-52 items-center justify-center">
          <ActivityIndicator size="large" color={DefaultTheme.colors.primary} />
        </View>
      </View>
    );
  }

  // Week View
  if (period === 'week') {
    const weekDays = getCurrentWeekDays(currentWeekStart);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const weekStartDate = weekDays[0];
    const weekEndDate = weekDays[6];
    const weekRange = `${weekStartDate.getDate()}/${weekStartDate.getMonth() + 1} - ${weekEndDate.getDate()}/${weekEndDate.getMonth() + 1}`;

    return (
      <View className="rounded-lg bg-card p-4 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={navigateToPreviousWeek}
            className="rounded-full p-2"
            activeOpacity={0.7}>
            <ChevronLeft size={20} className="text-foreground" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold">
            {filterType
              ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} - ${weekRange}`
              : `Week ${weekRange}`}
          </Text>
          
          <TouchableOpacity
            onPress={navigateToNextWeek}
            className="rounded-full p-2"
            activeOpacity={0.7}>
            <ChevronRight size={20} className="text-foreground" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          {weekDays.map((day, index) => {
            const dateString = getDateString(day);
            const count = activityCounts[dateString] || 0;

            return (
              <View key={index} className="items-center">
                <Text className="mb-2 text-xs text-gray-500">{dayNames[index]}</Text>
                <View
                  className="h-8 w-8 items-center justify-center rounded-sm"
                  style={{
                    backgroundColor: getIntensityColor(count),
                  }}>
                  <Text
                    className="text-xs font-medium"
                    style={{
                      color: count > 0 ? DefaultTheme.colors.foreground : DefaultTheme.colors.muted,
                    }}>
                    {day.getDate()}
                  </Text>
                </View>
                <Text className="mt-1 text-xs text-gray-500">{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="mt-4 flex-row items-center justify-end">
          <Text className="mr-2 text-xs text-gray-500">Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              className="mr-1 h-3 w-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(level) }}
            />
          ))}
          <Text className="ml-2 text-xs text-gray-500">More</Text>
        </View>
      </View>
    );
  }

  // Month View
  if (period === 'month') {
    const monthWeeks = getMonthDays(currentYear, currentMonth);
    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <View className="rounded-lg bg-card p-4 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={navigateToPreviousMonth}
            className="rounded-full p-2"
            activeOpacity={0.7}>
            <ChevronLeft size={20} className="text-foreground" />
          </TouchableOpacity>
          
          <Text className="text-lg font-bold">
            {filterType
              ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} - ${monthName}`
              : monthName}
          </Text>
          
          <TouchableOpacity
            onPress={navigateToNextMonth}
            className="rounded-full p-2"
            activeOpacity={0.7}>
            <ChevronRight size={20} className="text-foreground" />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View className="mb-2 flex-row">
          {dayNames.map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-xs font-medium text-gray-600">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {monthWeeks.map((week, weekIndex) => (
          <View key={weekIndex} className="mb-1 flex-row">
            {week.map((day, dayIndex) => {
              const dateString = getDateString(day);
              const count = activityCounts[dateString] || 0;
              const isCurrentMonth = day.getMonth() === currentMonth;

              return (
                <View key={dayIndex} className="flex-1 items-center">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-sm"
                    style={{
                      backgroundColor: isCurrentMonth ? getIntensityColor(count) : '#f8f9fa',
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}>
                    <Text
                      className="text-xs font-medium"
                      style={{
                        color:
                          isCurrentMonth && count > 0
                            ? DefaultTheme.colors.foreground
                            : DefaultTheme.colors.muted,
                      }}>
                      {day.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Legend */}
        <View className="mt-4 flex-row items-center justify-end">
          <Text className="mr-2 text-xs text-gray-500">Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              className="mr-1 h-3 w-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(level) }}
            />
          ))}
          <Text className="ml-2 text-xs text-gray-500">More</Text>
        </View>
      </View>
    );
  }

  // Year View (GitHub style)
  const weeks = getWeeksInYear(currentYear);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <View className="rounded-lg bg-card p-4 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={navigateToPreviousYear}
          className="rounded-full p-2"
          activeOpacity={0.7}>
          <ChevronLeft size={20} className="text-foreground" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold">
          {filterType
            ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} - ${currentYear}`
            : `Activity Heatmap ${currentYear}`}
        </Text>
        
        <TouchableOpacity
          onPress={navigateToNextYear}
          className="rounded-full p-2"
          activeOpacity={0.7}>
          <ChevronRight size={20} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View className="flex-col">
          {/* Month labels */}
          <View className="mb-2 w-full flex-row justify-between">
            {months.map((month, index) => (
              <Text key={month} className="flex-1 text-center text-xs text-gray-500">
                {month}
              </Text>
            ))}
          </View>

          {/* Day labels and grid */}
          <View className="flex-row">
            {/* Day of week labels */}
            <View className="mr-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <View key={index} className="mb-1 h-3 w-3 items-center justify-center">
                  <Text className="text-xs text-gray-500">{index % 2 === 1 ? day : ''}</Text>
                </View>
              ))}
            </View>

            {/* Heatmap grid */}
            <View className="flex-1 flex-row">
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} className="mr-1 flex-col">
                  {week.map((day, dayIndex) => {
                    const dateString = getDateString(day);
                    const count = activityCounts[dateString] || 0;
                    const isCurrentYear = day.getFullYear() === currentYear;

                    return (
                      <View
                        key={dayIndex}
                        className="mb-1 h-3 w-3 rounded-sm"
                        style={{
                          backgroundColor: isCurrentYear ? getIntensityColor(count) : '#f0f0f0',
                          opacity: isCurrentYear ? 1 : 0.3,
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="mt-4 flex-row items-center justify-end">
        <Text className="mr-2 text-xs text-gray-500">Less</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View
            key={level}
            className="mr-1 h-3 w-3 rounded-sm"
            style={{ backgroundColor: getIntensityColor(level) }}
          />
        ))}
        <Text className="ml-2 text-xs text-gray-500">More</Text>
      </View>
    </View>
  );
}
