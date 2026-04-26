import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface AvatarProps { uri: string | null; name: string; size?: number; rank?: number; style?: ViewStyle; }

export function Avatar({ uri, name, size = 48, rank, style }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const bc = rank && rank <= 3 ? ['', '#FFD700', '#C0C0C0', '#CD7F32'][rank] : theme.colors.border;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, borderColor: bc, borderWidth: rank && rank <= 3 ? 2.5 : 1.5, alignItems: 'center', justifyContent: 'center' }, style]}>
      {uri ? <Image source={{ uri }} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} /> :
        <View style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2, backgroundColor: theme.colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', fontSize: size * 0.35 }}>{initials}</Text>
        </View>}
    </View>
  );
}
