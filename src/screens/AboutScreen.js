/*
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

export default function AboutScreen({ onBack }) {
  const { appTheme } = useTheme();
  const [modalType, setModalType] = useState(null); // 'terms' | 'privacy' | 'license' | null
  const [updateMessage, setUpdateMessage] = useState(null);

  const handleCheckUpdate = () => {
    setUpdateMessage('Checking for updates...');
    setTimeout(() => {
      setUpdateMessage('✨ You are running the latest version of LudoVexa (v1.4.2)!');
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
      <ScreenHeader title="About App" onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={[styles.logoCircle, { backgroundColor: appTheme.colors.primary }]}>
            <Text style={styles.logoText}>🎲</Text>
          </View>
          <Text style={[styles.appName, { color: appTheme.colors.text }]}>LudoVexa App</Text>
          <Text style={[styles.appTagline, { color: appTheme.colors.secondaryText }]}>
            Next-Gen Multiplayer & Offline Ludo Board Game
          </Text>

          <View style={styles.versionPill}>
            <Text style={[styles.versionText, { color: appTheme.colors.secondaryText }]}>
              Version 1.4.2 (Build 2026.09.16)
            </Text>
          </View>
        </View>

        <View style={[styles.updateCard, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
          <View style={styles.updateRow}>
            <View style={styles.updateLeft}>
              <Text style={[styles.updateTitle, { color: appTheme.colors.text }]}>Software Updates</Text>
              <Text style={[styles.updateSub, { color: appTheme.colors.secondaryText }]}>
                {updateMessage || 'Auto-check enabled'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckUpdate}
              style={[styles.checkBtn, { backgroundColor: appTheme.colors.primary }]}
            >
              <Text style={styles.checkBtnText}>Check Update</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>LEGAL & POLICIES</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalType('terms')}
              style={styles.menuRow}
            >
              <Text style={[styles.menuTitle, { color: appTheme.colors.text }]}>Terms of Service</Text>
              <Text style={[styles.menuArrow, { color: appTheme.colors.primary }]}>→</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalType('privacy')}
              style={styles.menuRow}
            >
              <Text style={[styles.menuTitle, { color: appTheme.colors.text }]}>Privacy Policy</Text>
              <Text style={[styles.menuArrow, { color: appTheme.colors.primary }]}>→</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalType('license')}
              style={styles.menuRow}
            >
              <Text style={[styles.menuTitle, { color: appTheme.colors.text }]}>Open Source Licenses</Text>
              <Text style={[styles.menuArrow, { color: appTheme.colors.primary }]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>CREDITS & COMMUNITY</Text>
          <View style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.secondaryText }]}>Developer</Text>
              <Text style={[styles.infoValue, { color: appTheme.colors.text }]}>Vexa Games Studio</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.secondaryText }]}>Engine</Text>
              <Text style={[styles.infoValue, { color: appTheme.colors.text }]}>React Native 0.79</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: appTheme.colors.secondaryText }]}>Support Email</Text>
              <Text style={[styles.infoValue, { color: appTheme.colors.primary }]}>
                support@vexagames.com
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: appTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: appTheme.colors.text }]}>
                {modalType === 'terms'
                  ? 'Terms of Service'
                  : modalType === 'privacy'
                  ? 'Privacy Policy'
                  : 'Open Source Licenses'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Text style={[styles.closeBtn, { color: appTheme.colors.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalText, { color: appTheme.colors.text }]}>
                {modalType === 'terms' &&
                  `Welcome to LudoVexa! By downloading or playing our application, you agree to comply with our Terms of Service.`}

                {modalType === 'privacy' &&
                  `Your privacy is vital to us. LudoVexa respects your personal data.`}

                {modalType === 'license' &&
                  `LudoVexa App is built using modern open source software.`}
              </Text>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalType(null)}
              style={[styles.modalDoneBtn, { backgroundColor: appTheme.colors.primary }]}
            >
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  versionPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 14,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  updateCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateLeft: {
    flex: 1,
    paddingRight: 10,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  updateSub: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuArrow: {
    fontSize: 16,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
  modalDoneBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
*/

export default function AboutScreen() {
  return null;
}

