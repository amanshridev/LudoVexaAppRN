import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.LudoVexaApp';
const PLAY_STORE_MARKET_URL = 'market://details?id=com.LudoVexaApp';
const HAS_RATED_KEY = '@LudoVexa_HasRated';
const LAST_PROMPT_KEY = '@LudoVexa_LastRatingPrompt';

const { width } = Dimensions.get('window');

// Global rating modal controller listeners
type RatingModalListener = (visible: boolean) => void;
const ratingListeners = new Set<RatingModalListener>();

export const showAppRatingModal = () => {
    ratingListeners.forEach((listener) => listener(true));
};

export const hideAppRatingModal = () => {
    ratingListeners.forEach((listener) => listener(false));
};

export const openPlayStoreRating = async () => {
    try {
        const supported = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
        if (supported) {
            await Linking.openURL(PLAY_STORE_MARKET_URL);
            return;
        }
    } catch (_) { }
    try {
        await Linking.openURL(PLAY_STORE_URL);
    } catch (_) { }
};

// SVG Icon components
const HeartIcon = ({ size = 38, color = '#F59E0B' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
);

const WrenchIcon = ({ size = 36, color = '#38BDF8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </Svg>
);

const CloseIcon = ({ size = 20, color = '#94A3B8' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

export interface AppRatingModalProps {
    visible?: boolean;
    onClose?: () => void;
}

export default function AppRatingModal({ visible: externalVisible, onClose }: AppRatingModalProps) {
    const { appTheme, settings } = useTheme();
    const locale = settings?.language || 'en';
    const [internalVisible, setInternalVisible] = useState(false);
    const [step, setStep] = useState<'ask' | 'feedback'>('ask');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const handleListener = (v: boolean) => setInternalVisible(v);
        ratingListeners.add(handleListener);
        return () => {
            ratingListeners.delete(handleListener);
        };
    }, []);

    const isVisible = externalVisible !== undefined ? externalVisible : internalVisible;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalVisible(false);
        }
    };

    const tRating = {
        askTitle: locale === 'hi' ? 'Ludo  कैसा लग रहा है?' : 'Enjoying Ludo Vexa?',
        askSub: locale === 'hi' ? 'क्या आपको Ludo  गेम खेलने में मज़ा आ रहा है?' : 'Are you having fun playing Ludo Vexa?',
        loveIt: locale === 'hi' ? 'हाँ, बहुत पसंद आया! ⭐️' : 'Yes, Love it! ⭐️',
        improve: locale === 'hi' ? 'सुधार की आवश्यकता है 🛠️' : 'Could be better 🛠️',

        feedbackTitle: locale === 'hi' ? 'हम सुधार करना चाहेंगे!' : "We'd love to improve!",
        feedbackSub: locale === 'hi' ? 'हम गेम अनुभव को और बेहतर बनाने के लिए क्या कर सकते हैं?' : 'What can we do to make your game experience better?',
        feedbackPlaceholder: locale === 'hi' ? 'अपने सुझाव यहाँ लिखें...' : 'Type your suggestion here...',
        submitBtn: locale === 'hi' ? 'सुझाव भेजें 📩' : 'Send Feedback 📩',
        laterBtn: locale === 'hi' ? 'बाद में' : 'Maybe Later',
    };

    const handleLoveIt = async () => {
        try {
            await AsyncStorage.setItem(HAS_RATED_KEY, 'true');
            await openPlayStoreRating();
        } catch (error) {
            console.log('Error opening store for rating:', error);
        }
        handleClose();
    };

    const handleImprove = () => {
        setStep('feedback');
    };

    const handleLater = async () => {
        try {
            await AsyncStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
        } catch (error) {
            console.log('Error saving rating prompt state:', error);
        }
        handleClose();
    };

    const handleSubmitFeedback = async () => {
        if (feedback.trim()) {
            try {
                const email = 'support@ludovexa.com';
                const subject = encodeURIComponent('Ludo Vexa App Feedback');
                const body = encodeURIComponent(feedback.trim());

                Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`).catch(() => {
                    console.log('Could not open mail client');
                });
            } catch (error) {
                console.log('Feedback email trigger error:', error);
            }
        }

        try {
            await AsyncStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
        } catch (_) { }
        handleClose();
    };

    if (!isVisible) return null;

    const surfaceBg = appTheme?.cardBg || '#0F172A';
    const textColor = appTheme?.textPrimary || '#F8FAFC';
    const textSecondaryColor = appTheme?.textSecondary || '#94A3B8';
    const accentColor = appTheme?.primary || '#F59E0B';
    const borderColor = appTheme?.cardBorder || 'rgba(255, 255, 255, 0.12)';

    return (
        <Modal transparent animationType="fade" visible={isVisible} onRequestClose={handleLater}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.modalContent, { backgroundColor: surfaceBg, borderColor }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleLater} activeOpacity={0.7}>
                        <CloseIcon size={20} color={textSecondaryColor} />
                    </TouchableOpacity>

                    {step === 'ask' && (
                        <View style={styles.innerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                                <HeartIcon size={42} color={accentColor} />
                            </View>
                            <Text style={[styles.title, { color: textColor }]}>{tRating.askTitle}</Text>
                            <Text style={[styles.description, { color: textSecondaryColor }]}>{tRating.askSub}</Text>

                            <TouchableOpacity
                                style={[styles.primaryBtn, { backgroundColor: accentColor }]}
                                onPress={handleLoveIt}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryBtnText}>{tRating.loveIt}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleImprove} activeOpacity={0.8}>
                                <Text style={[styles.secondaryBtnText, { color: textSecondaryColor }]}>{tRating.improve}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'feedback' && (
                        <View style={styles.innerContent}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                                <WrenchIcon size={40} color="#38BDF8" />
                            </View>
                            <Text style={[styles.title, { color: textColor }]}>{tRating.feedbackTitle}</Text>
                            <Text style={[styles.description, { color: textSecondaryColor }]}>{tRating.feedbackSub}</Text>

                            <TextInput
                                style={[styles.input, { color: textColor, borderColor }]}
                                placeholder={tRating.feedbackPlaceholder}
                                placeholderTextColor="#64748B"
                                multiline
                                numberOfLines={3}
                                value={feedback}
                                onChangeText={setFeedback}
                                returnKeyType="done"
                            />

                            <TouchableOpacity
                                style={[styles.primaryBtn, { backgroundColor: '#38BDF8' }]}
                                onPress={handleSubmitFeedback}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryBtnText}>{tRating.submitBtn}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleLater} activeOpacity={0.8}>
                                <Text style={[styles.secondaryBtnText, { color: textSecondaryColor }]}>{tRating.laterBtn}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: Math.min(width - 48, 380),
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
        zIndex: 1,
    },
    innerContent: {
        width: '100%',
        alignItems: 'center',
    },
    iconContainer: {
        width: 74,
        height: 74,
        borderRadius: 37,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    primaryBtn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    secondaryBtnText: {
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        marginBottom: 20,
        textAlignVertical: 'top',
        minHeight: 80,
    },
});