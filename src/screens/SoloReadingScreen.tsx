import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Share,
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import AppHeader from '../components/AppHeader';
import AboutScreen from './AboutScreen';
import Markdown from '../components/Markdown';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { baziApi, BaziReadingRequest, BaziFollowupRequest } from '../services/api';
import { useLoading } from '../components/LoadingProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Markdown already imported above

const SoloReadingScreen = () => {
    const insets = useSafeAreaInsets();
    const [birthDate, setBirthDate] = useState(new Date());
    const [birthTime, setBirthTime] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [tempTime, setTempTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [reading, setReading] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [cachedAnswers, setCachedAnswers] = useState<Record<string, string>>({});
    const [aboutOpen, setAboutOpen] = useState(false);
    const { show, hide } = useLoading();
    // Full-screen horizontal swipe to close About modal
    const fullScreenSwipeResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Start capturing when a rightward horizontal swipe is detected with minimal vertical movement
                return gestureState.dx > 12 && Math.abs(gestureState.dy) < 20;
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > 80 && Math.abs(gestureState.dy) < 60) {
                    setAboutOpen(false);
                }
            },
        })
    ).current;

    // Build a stable cache key for a reading based on DOB and time
    const getReadingCacheKey = (date: Date, time: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const timeStr = format(time, 'HH:mm');
        return `solo-reading:${dateStr}:${timeStr}`;
    };

    const loadProfileDefaults = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem('userProfile');
            if (saved) {
                const profile = JSON.parse(saved);
                if (profile.birthDate) {
                    const parsedDate = new Date(profile.birthDate);
                    if (!isNaN(parsedDate.getTime())) setBirthDate(parsedDate);
                    // Attempt to load cached reading if time is available
                    if (profile.birthTime) {
                        const parsedTime = new Date(`2000-01-01T${profile.birthTime}:00`);
                        if (!isNaN(parsedTime.getTime())) {
                            const cacheKey = getReadingCacheKey(parsedDate, parsedTime);
                            const cachedReading = await AsyncStorage.getItem(cacheKey);
                            if (cachedReading) setReading(cachedReading);
                        }
                    }
                }
                if (profile.birthTime) {
                    const parsedTime = new Date(`2000-01-01T${profile.birthTime}:00`);
                    if (!isNaN(parsedTime.getTime())) setBirthTime(parsedTime);
                }
            }
        } catch (e) {
            // ignore
        }
    }, []);

    useEffect(() => {
        loadProfileDefaults();
    }, [loadProfileDefaults]);

    useFocusEffect(
        useCallback(() => {
            // Refresh DOB/time whenever this screen gains focus
            loadProfileDefaults();
        }, [loadProfileDefaults])
    );

    const handleGetReading = async () => {
        try {
            setLoading(true);
            show({ title: 'Generating Your Reading', subtitle: 'Consulting the stars...', blocking: true });

            const requestData: BaziReadingRequest = {
                birthDate: format(birthDate, 'yyyy-MM-dd'),
                birthTime: format(birthTime, 'HH:mm'),
            };

            const response = await baziApi.getBaziReading(requestData);
            setReading(response.reading);
            // Cache reading for this DOB/time
            try {
                const cacheKey = getReadingCacheKey(birthDate, birthTime);
                await AsyncStorage.setItem(cacheKey, response.reading);
            } catch { }
            setSelectedQuestion(null);
            setFollowUpAnswer(null);
        } catch (error) {
            console.error('Error getting reading:', error);
            Alert.alert('Error', 'Failed to get your Bazi reading. Please try again.');
        } finally {
            setLoading(false);
            hide();
        }
    };

    const handleFollowUpClick = async (question: string) => {
        try {
            // Toggle collapse if clicking the same question with an answer
            if (selectedQuestion === question && followUpAnswer && !followUpLoading) {
                setSelectedQuestion(null);
                setFollowUpAnswer(null);
                return;
            }
            setSelectedQuestion(question);
            // Serve from cache if present
            if (cachedAnswers[question]) {
                setFollowUpAnswer(cachedAnswers[question]);
                return;
            }
            setFollowUpLoading(true);
            show({ title: 'Answering Your Question', subtitle: 'Thinking deeply...', blocking: true });
            const requestData: BaziFollowupRequest = {
                birthDate: format(birthDate, 'yyyy-MM-dd'),
                question,
            };
            const response = await baziApi.getBaziFollowup(requestData);
            setFollowUpAnswer(response.content);
            setCachedAnswers(prev => ({ ...prev, [question]: response.content }));
        } catch (error) {
            console.error('Error getting follow-up:', error);
            Alert.alert('Error', 'Failed to get the answer. Please try again.');
        } finally {
            setFollowUpLoading(false);
            hide();
        }
    };

    const handleShareReading = async () => {
        if (!reading) return;
        try {
            await Share.share({
                message: `${reading}\n\n— via BaziGPT`,
            });
        } catch (e) {
            // ignore cancel
        }
    };

    const handleStartOver = () => {
        setReading(null);
        setSelectedQuestion(null);
        setFollowUpAnswer(null);
        setCachedAnswers({});
        // Best-effort clear of cached reading for current DOB/time
        try {
            const cacheKey = getReadingCacheKey(birthDate, birthTime);
            AsyncStorage.removeItem(cacheKey);
        } catch { }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['left', 'right', 'bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                contentContainerStyle={{ paddingBottom: SIZES.xl }}
                scrollIndicatorInsets={{ top: 0 }}
            >
                <AppHeader onPressAbout={() => setAboutOpen(true)} scrollable />
                <View style={[styles.headerSub, { paddingTop: 0 }]}>
                    <Text style={styles.title}>Personal Reading</Text>
                    <Text style={styles.subtitle}>
                        Discover your destiny through AI-powered Chinese astrology
                    </Text>
                </View>

                {!reading && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Get Your Bazi Reading</Text>

                        {/* Birth Date */}
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => { setTempDate(birthDate); setOpenDatePicker(true); }}
                        >
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.inputText}>
                                Birth Date: {format(birthDate, 'MMM dd, yyyy')}
                            </Text>
                        </TouchableOpacity>

                        {/* Birth Time */}
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => { setTempTime(birthTime); setOpenTimePicker(true); }}
                        >
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.inputText}>
                                Birth Time: {format(birthTime, 'HH:mm')}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.helperText}>If not provided, noon (12:00) will be used as a reference point</Text>

                        {/* Gender input removed per web parity */}

                        {/* Get Reading Button */}
                        <TouchableOpacity onPress={handleGetReading} disabled={loading} activeOpacity={0.9}>
                            <LinearGradient
                                colors={[COLORS.primary, '#ffb74d']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.text} />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles" size={20} color={COLORS.text} />
                                        <Text style={styles.submitButtonText}>Get My Reading</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reading Result */}
                {reading && (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Your Bazi Reading</Text>
                            <Markdown>{reading}</Markdown>
                            <Text style={styles.birthDetails}>
                                Birth: {format(birthDate, 'MM/dd/yyyy')}{birthTime ? ` at ${format(birthTime, 'HH:mm')}` : ''}
                            </Text>
                        </View>

                        {/* Follow-up Section (separate card) */}
                        <View style={styles.card}>
                            <Text style={styles.followupTitle}>Ask Follow-up Questions</Text>
                            <Text style={styles.followupSubtitle}>
                                Get more specific insights about different aspects of your life:
                            </Text>
                            <View style={styles.followupButtons}>
                                {[
                                    'What about my career?',
                                    'What about my health?',
                                    'What about my relationships?',
                                    'What about my finances?',
                                    'What about my education?',
                                    'What about my travel opportunities?',
                                ].map((q) => (
                                    <View key={q} style={{ width: '100%' }}>
                                        <TouchableOpacity
                                            style={[styles.followupButton, selectedQuestion === q && styles.followupButtonActive]}
                                            onPress={() => handleFollowUpClick(q)}
                                            disabled={followUpLoading}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.followupButtonText, selectedQuestion === q && styles.followupButtonTextActive]}>
                                                {q.toUpperCase()}
                                            </Text>
                                            {cachedAnswers[q] ? (
                                                <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
                                            ) : null}
                                        </TouchableOpacity>

                                        {selectedQuestion === q && (
                                            <View style={{ paddingVertical: SIZES.sm }}>
                                                {followUpLoading ? (
                                                    <ActivityIndicator color={COLORS.primary} />
                                                ) : followUpAnswer ? (
                                                    <View style={styles.followupAnswerCard}>
                                                        <Text style={styles.followupAnswerTitle}>{q}</Text>
                                                        <Markdown>{followUpAnswer}</Markdown>
                                                    </View>
                                                ) : null}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Share and Start Over Actions */}
                        <View style={{ marginHorizontal: SIZES.lg, marginTop: SIZES.md }}>
                            <TouchableOpacity onPress={handleShareReading} activeOpacity={0.9}>
                                <LinearGradient
                                    colors={[COLORS.primary, '#ffb74d']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientButton}
                                >
                                    <Ionicons name="share-social" size={20} color={COLORS.text} />
                                    <Text style={styles.submitButtonText}>Share Reading</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleStartOver} activeOpacity={0.9} style={{ marginTop: SIZES.sm }}>
                                <View style={[styles.button, styles.startOverButton]}>
                                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                                    <Text style={styles.startOverText}>Start Over</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Date Picker Modal (confirm/cancel) */}
                <Modal visible={openDatePicker} transparent animationType="slide">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selected) => {
                                    if (selected) setTempDate(selected);
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setOpenDatePicker(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => { setBirthDate(tempDate); setOpenDatePicker(false); }}>
                                    <Text style={styles.saveButtonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Time Picker Modal (confirm/cancel) */}
                <Modal visible={openTimePicker} transparent animationType="slide">
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display="spinner"
                                onChange={(event, selected) => {
                                    if (selected) setTempTime(selected);
                                }}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setOpenTimePicker(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => { setBirthTime(tempTime); setOpenTimePicker(false); }}>
                                    <Text style={styles.saveButtonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* About Fullscreen Modal */}
                <Modal visible={aboutOpen} animationType="slide" onRequestClose={() => setAboutOpen(false)}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['left', 'right', 'bottom']}>
                        <View style={{ flex: 1 }} {...fullScreenSwipeResponder.panHandlers}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.md, paddingTop: insets.top + SIZES.xs }}>
                                <TouchableOpacity
                                    onPress={() => setAboutOpen(false)}
                                    accessibilityLabel="Close About"
                                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                                    style={{ padding: 6 }}
                                >
                                    <Ionicons name="close" size={28} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                            <AboutScreen />
                        </View>
                    </SafeAreaView>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.md,
        alignItems: 'center',
        paddingBottom: SIZES.sm,
    },
    headerSub: {
        paddingHorizontal: SIZES.md,
        alignItems: 'center',
        paddingBottom: SIZES.sm,
        marginTop: SIZES.md,
        marginBottom: SIZES.sm,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)', // Semi-transparent to blend with background
        marginHorizontal: SIZES.sm,
        marginVertical: SIZES.sm,
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.2)', // Subtle orange border
    },
    cardTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    inputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginLeft: SIZES.sm,
    },
    helperText: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginBottom: SIZES.md,
        textAlign: 'center',
    },
    genderContainer: {
        marginBottom: SIZES.md,
    },
    label: {
        fontSize: SIZES.body,
        color: COLORS.text,
        marginBottom: SIZES.sm,
    },
    genderButtons: {
        flexDirection: 'row',
        gap: SIZES.sm,
    },
    genderButton: {
        flex: 1,
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    genderButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderButtonText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    genderButtonTextActive: {
        color: COLORS.text,
        fontWeight: '700',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        gap: SIZES.sm,
    },
    submitButtonText: {
        fontSize: SIZES.body,
        fontWeight: '700',
        color: COLORS.text,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        gap: SIZES.sm,
    },
    readingText: {
        fontSize: SIZES.body,
        color: COLORS.text,
        lineHeight: 24,
    },
    birthDetails: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        marginTop: SIZES.md,
        marginBottom: SIZES.sm,
        textAlign: 'center',
    },
    followupContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: SIZES.radius,
        padding: SIZES.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.1)',
        marginTop: SIZES.md,
    },
    followupTitle: {
        fontSize: SIZES.h5,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    followupSubtitle: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        marginBottom: SIZES.sm,
    },
    followupButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
        marginBottom: SIZES.md,
    },
    followupButton: {
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: SIZES.radius,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },
    followupButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    followupButtonText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    followupButtonTextActive: {
        color: COLORS.primary,
    },
    followupAnswerCard: {
        backgroundColor: 'rgba(255, 152, 0, 0.05)',
        borderRadius: SIZES.radius,
        padding: SIZES.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.2)',
    },
    followupAnswerTitle: {
        fontSize: SIZES.h5,
        color: COLORS.primary,
        fontWeight: '700',
        marginBottom: SIZES.sm,
    },
    startOverButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    startOverText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: SIZES.body,
        marginLeft: SIZES.xs,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: SIZES.radiusLg,
        borderTopRightRadius: SIZES.radiusLg,
        padding: SIZES.lg,
    },
    modalActions: {
        flexDirection: 'row',
        gap: SIZES.sm,
        marginTop: SIZES.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        gap: SIZES.xs,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    saveButtonText: {
        fontSize: SIZES.body,
        fontWeight: '700',
        color: COLORS.text,
    },
    cancelButton: {
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
});

export default SoloReadingScreen;
