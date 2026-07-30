import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff } from 'lucide-react-native';

interface Props {
  visible: boolean;
}

const OfflineBadge: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.badge}>
      <WifiOff size={12} color="#92400E" />
      <Text style={styles.text}>Offline mode</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
});

export default OfflineBadge;
