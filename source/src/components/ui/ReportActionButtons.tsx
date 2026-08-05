import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Eye, Download, Share2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface ReportActionButtonsProps {
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export const ReportActionButtons: React.FC<ReportActionButtonsProps> = ({
  onView,
  onDownload,
  onShare,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.7} style={styles.btn} onPress={onView}>
        <Eye size={15} color={colors.primary} style={styles.icon} />
        <Text style={styles.btnText}>View</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} style={styles.btn} onPress={onDownload}>
        <Download size={15} color={colors.primary} style={styles.icon} />
        <Text style={styles.btnText}>Download</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} style={styles.btn} onPress={onShare}>
        <Share2 size={15} color={colors.primary} style={styles.icon} />
        <Text style={styles.btnText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  icon: {
    marginRight: 6,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
