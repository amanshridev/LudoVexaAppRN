import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Vibration,
} from 'react-native';
import SoundManager from '../../utils/SoundManager';
import { CoinIcon } from '../ui/AppIcons';

const AVATAR_OPTIONS = [
  '🦁', '👑', '🐯', '🐺', '🦊', '🦅',
  '🚀', '💎', '🎲', '⚡', '🔥', '🏆',
  '👨‍💼', '👩‍💼', '🥷', '🧙‍♂️', '🦸‍♂️', '🤴',
];

export default function PlayerProfileModal({
  visible,
  onClose,
  user,
  onSaveProfile,
  theme,
}) {
  const [name, setName] = useState(user?.name || 'Player 1');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🦁');

  const stats = user?.stats || { played: 0, won: 0, winRate: 0 };
  const coins = user?.coins || 0;

  const handleSelectAvatar = (av) => {
    try {
      SoundManager.play('buttonTap');
      Vibration.vibrate(15);
    } catch (_) {}
    setSelectedAvatar(av);
  };

  const handleSave = () => {
    try {
      SoundManager.play('buttonTap');
      Vibration.vibrate(25);
    } catch (_) {}
    const trimmed = name.trim() || 'Player 1';
    onSaveProfile?.({
      ...user,
      name: trimmed,
      avatar: selectedAvatar,
    });
    onClose?.();
  };

  const bg = theme?.colors?.background || '#071126';
  const surface = theme?.colors?.surface || '#0F1E36';
  const primary = theme?.colors?.primary || '#2563EB';
  const textColor = theme?.colors?.text || '#FFFFFF';
  const subtextColor = theme?.colors?.secondaryText || '#94A3B8';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: textColor }]}>Player Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Top Avatar Hero */}
            <View style={styles.avatarHero}>
              <View style={[styles.avatarBigCircle, { backgroundColor: `${primary}30`, borderColor: primary }]}>
                <Text style={styles.avatarBigEmoji}>{selectedAvatar}</Text>
              </View>
              {/* Coin Badge */}
              <View style={styles.coinBadge}>
                <CoinIcon size={14} />
                <Text style={styles.coinBadgeText}>{coins.toLocaleString()} Coins</Text>
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: subtextColor }]}>PLAYER NAME</Text>
              <View style={[styles.inputBox, { backgroundColor: bg, borderColor: 'rgba(255,255,255,0.12)' }]}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  maxLength={15}
                  placeholder="Enter name"
                  placeholderTextColor={subtextColor}
                  style={[styles.textInput, { color: textColor }]}
                />
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: bg }]}>
                <Text style={[styles.statNumber, { color: textColor }]}>{stats.played || 0}</Text>
                <Text style={[styles.statLabel, { color: subtextColor }]}>Played</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: bg }]}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.won || 0}</Text>
                <Text style={[styles.statLabel, { color: subtextColor }]}>Won</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: bg }]}>
                <Text style={[styles.statNumber, { color: '#FBBF24' }]}>{stats.winRate || 0}%</Text>
                <Text style={[styles.statLabel, { color: subtextColor }]}>Win Rate</Text>
              </View>
            </View>

            {/* Choose Avatar Grid */}
            <View style={styles.avatarSection}>
              <Text style={[styles.inputLabel, { color: subtextColor }]}>CHOOSE AVATAR</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av;
                  return (
                    <TouchableOpacity
                      key={av}
                      activeOpacity={0.7}
                      onPress={() => handleSelectAvatar(av)}
                      style={[
                        styles.avatarOption,
                        { backgroundColor: bg },
                        isSelected && { borderColor: primary, backgroundColor: `${primary}25` },
                      ]}
                    >
                      <Text style={styles.avatarOptionEmoji}>{av}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: primary }]}
            >
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '82%',
    borderRadius: 22,
    borderWidth: 1.5,
    paddingTop: 18,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatarHero: {
    alignItems: 'center',
    marginVertical: 8,
  },
  avatarBigCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarBigEmoji: {
    fontSize: 38,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  coinBadgeText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '800',
  },
  inputSection: {
    marginTop: 10,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  avatarSection: {
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '14.5%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarOptionEmoji: {
    fontSize: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  saveBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
