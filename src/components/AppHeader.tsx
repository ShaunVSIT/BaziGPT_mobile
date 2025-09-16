import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
    onPressAbout?: () => void;
    scrollable?: boolean; // When true, header handles its own top safe area
}

const AppHeader: React.FC<AppHeaderProps> = ({ onPressAbout, scrollable = false }) => {
    const insets = useSafeAreaInsets();

    // Only add top safe area padding when in scrollable mode
    const topPadding = scrollable ? insets.top + SIZES.xs : SIZES.md;

    return (
        <View style={[styles.container, { paddingTop: topPadding }]}>
            <View style={styles.leftRow}>
                <Image source={require('../../assets/icon.png')} style={styles.logo} />
                <Text style={styles.title}>BaziGPT</Text>
            </View>
            <TouchableOpacity
                onPress={onPressAbout}
                activeOpacity={0.8}
                style={styles.aboutButton}
            >
                <Ionicons name="information-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: SIZES.sm,
        paddingTop: SIZES.md,
        paddingBottom: SIZES.xs,
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.xs,
    },
    logo: {
        width: 28,
        height: 28,
        borderRadius: 6,
    },
    title: {
        fontSize: SIZES.h3,
        fontWeight: '800',
        color: COLORS.text,
    },
    aboutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    aboutText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default AppHeader;


