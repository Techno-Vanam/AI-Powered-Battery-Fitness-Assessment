import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, ArrowLeft } from 'lucide-react-native';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import Screen from '../../components/ui/Screen';
import { colors, layout } from '../../theme';

const TC_CONTENT = `
Last Updated: July 2025

1. ACCEPTANCE OF TERMS
By registering and using the Sports Assessment Platform ("the App"), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before proceeding.

2. ELIGIBILITY
This application is intended for athletes, coaches, and sports educators associated with recognized institutions. By registering, you confirm that you are eligible to participate in the specified categories.

3. DATA COLLECTION AND STORAGE
The App collects personal information including but not limited to your name, date of birth, gender, contact details, and government-issued identification numbers (NSRS/APAAR/Aadhar). This data is:
• Stored securely on your device in an encrypted local database.
• Synchronized with our secure remote servers when internet connectivity is available.
• Never shared with unauthorized third parties without your explicit consent.

4. IDENTIFICATION VERIFICATION
You are required to provide a valid government-issued ID (NSRS, APAAR, or Aadhar). Providing false or inaccurate identification is a violation of these terms and may result in account suspension.

5. MINOR ATHLETES
Athletes under the age of 18 must have a parent or legal guardian complete the registration process and provide their consent. The guardian is responsible for the accuracy of all information provided.

6. PASSWORD AND SECURITY
You are responsible for maintaining the confidentiality of your account credentials. The App stores passwords using industry-standard hashing. You must immediately notify us if you suspect unauthorized access to your account.

7. OFFLINE USE
This application is designed to function in offline environments. Data entered while offline will be synchronized with our servers upon reconnection. You acknowledge that there may be a brief delay in synchronization.

8. ACCEPTABLE USE
You agree not to:
• Use the App for any fraudulent purpose.
• Attempt to gain unauthorized access to any part of the system.
• Submit false performance data or assessments.
• Use another person's identification credentials.

9. INTELLECTUAL PROPERTY
All content, logos, and software components of the App are the property of the Sports Assessment Authority and are protected under applicable intellectual property laws.

10. LIMITATION OF LIABILITY
The Sports Assessment Authority shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the App.

11. CHANGES TO TERMS
We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.

12. CONTACT
For questions or concerns regarding these Terms, please contact: support@sportsassessment.in
`;

const TermsAndConditionsScreen = ({ navigation, route }: any) => {
  const { onAccept } = route.params ?? {};
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 30;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (onAccept) onAccept();
    navigation.goBack();
  };

  return (
    <Screen
      scroll
      header={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={layout.iconMd - 2} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3">Terms & Conditions</AppText>
          <View style={styles.headerSpacer} />
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Button title="Accept & Return to Registration" role="athlete" onPress={handleAccept} style={styles.acceptBtn} />
          <TouchableOpacity style={styles.declineBtn} onPress={() => navigation.goBack()}>
            <AppText variant="bodySm" color={colors.textMuted}>
              Back Without Accepting
            </AppText>
          </TouchableOpacity>
        </View>
      }
      contentStyle={styles.scrollBody}
    >
      <View style={styles.iconRow}>
        <FileText size={layout.iconLg} color={colors.athlete.primary} />
      </View>
      <AppText variant="h3" style={styles.centered}>
        Sports Assessment Platform
      </AppText>
      <AppText variant="bodySm" color={colors.textSecondary} style={styles.centered}>
        Terms of Use & Privacy Policy
      </AppText>

      <View style={styles.divider} />

      <AppText variant="bodySm" color={colors.textLabel} style={styles.body}>
        {TC_CONTENT.trim()}
      </AppText>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.fieldGap + 8,
    paddingVertical: layout.fieldGap + 6,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 40 },
  scrollBody: {
    paddingTop: layout.fieldGap,
  },
  iconRow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.athlete.light,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: layout.fieldGap + 8,
  },
  centered: { textAlign: 'center' },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: layout.fieldGap + 8,
  },
  body: { lineHeight: layout.fieldGap + 16 },
  footer: {
    padding: layout.horizontalPadding - 4,
    paddingBottom: layout.fieldGap,
    gap: layout.fieldGap + 2,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  acceptBtn: { marginTop: 0 },
  declineBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TermsAndConditionsScreen;
