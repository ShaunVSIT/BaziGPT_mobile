import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const BackgroundDecorative: React.FC = () => {
    return (
        <View style={styles.bgContainer} pointerEvents="none">
            <LinearGradient
                colors={[COLORS.background, '#242424']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bgGradient}
            />
            {/* Subtle dark overlay to improve text contrast */}
            <LinearGradient
                colors={["rgba(0,0,0,0.22)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.muteOverlay}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    bgContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height + 100, // Extend beyond screen height to ensure full coverage
        zIndex: -1000, // Ensure it stays far behind everything
    },
    bgGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height + 100,
    },
    decorative: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: COLORS.primary,
        opacity: 0.08,
        borderRadius: 9999,
    },
    muteOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height * 0.6,
    },
    decorativeTopLeft: {
        width: 120,
        height: 120,
        top: 80, // Position for natural screen start
        left: 20,
    },
    decorativeTopRightLarge: {
        width: 220,
        height: 220,
        top: 30,
        right: -60,
        opacity: 0.06,
    },
    decorativeCenterLeftLarge: {
        width: 280,
        height: 280,
        top: height * 0.28,
        left: -100,
        opacity: 0.05,
    },
    decorativeBottomRight: {
        width: 160,
        height: 160,
        bottom: -20,
        right: 20,
    },
    decorativeBottomCenter: {
        width: 240,
        height: 240,
        bottom: -80,
        left: width * 0.25,
        opacity: 0.05,
    },
});

export default BackgroundDecorative;
