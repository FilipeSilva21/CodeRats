import React from 'react';
import { View, Image, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface AvatarProps { uri: string | null; name: string; size?: number; rank?: number; style?: ViewStyle | ViewStyle[]; }

export function Avatar({ uri, name, size = 48, rank, style }: AvatarProps) {
  const theme = useTheme();
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const bc = rank && rank <= 3 ? ['', '#FBBF24', '#9CA3AF', '#B45309'][rank] : theme.colors.border;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, borderColor: bc, borderWidth: rank && rank <= 3 ? 2 : 1, alignItems: 'center', justifyContent: 'center' }, style]}>
      {uri ? <Image source={{ uri }} style={{ width: size - 2, height: size - 2, borderRadius: (size - 2) / 2 }} /> :
        <View style={{ width: size - 2, height: size - 2, borderRadius: (size - 2) / 2, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' as const, fontSize: size * 0.35 }}>{initials}</Text>
        </View>}
    </View>
  );
}