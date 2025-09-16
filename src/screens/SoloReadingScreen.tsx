import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { baziApi, BaziReadingRequest } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    useEffect(() => {
        const loadProfileDefaults = async () => {
            try {
                const saved = await AsyncStorage.getItem('userProfile');
                if (saved) {
                    const profile = JSON.parse(saved);
                    if (profile.birthDate) {
                        const parsedDate = new Date(profile.birthDate);
                        if (!isNaN(parsedDate.getTime())) setBirthDate(parsedDate);
                    }
                    if (profile.birthTime) {
                        const parsedTime = new Date(`2000-01-01T${profile.birthTime}:00`);
                        if (!isNaN(parsedTime.getTime())) setBirthTime(parsedTime);
                    }
                }
            } catch (e) {
                // ignore
            }
        };
        loadProfileDefaults();
    }, []);

    const handleGetReading = async () => {
        try {
            setLoading(true);

            const requestData: BaziReadingRequest = {
                birthDate: format(birthDate, 'yyyy-MM-dd'),
                birthTime: format(birthTime, 'HH:mm'),
            };

            const response = await baziApi.getBaziReading(requestData);
            setReading(response.reading);
        } catch (error) {
            console.error('Error getting reading:', error);
            Alert.alert('Error', 'Failed to get your Bazi reading. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="never"
                scrollIndicatorInsets={{ top: 0, bottom: insets.bottom }}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingLeft: insets.left, paddingRight: insets.right },
                ]}
            >
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <Text style={styles.title}>Welcome to BaziGPT</Text>
                    <Text style={styles.subtitle}>
                        Discover your destiny through AI-powered Chinese astrology
                    </Text>
                </View>

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

                {/* Reading Result */}
                {reading && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Your Bazi Reading</Text>
                        <Text style={styles.readingText}>{reading}</Text>
                    </View>
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
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Let background component from App.tsx show through
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: SIZES.xl,
    },
    header: {
        paddingHorizontal: SIZES.lg,
        alignItems: 'center',
        paddingBottom: SIZES.lg,
        // paddingTop is now dynamically set using safe area insets
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
        marginHorizontal: SIZES.lg,
        marginVertical: SIZES.md,
        padding: SIZES.lg,
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
