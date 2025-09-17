import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export type LoadingOverlayProps = {
    visible: boolean;
    title?: string;
    subtitle?: string;
    progress?: number | null; // 0..1
    blocking?: boolean; // if true, block touches behind the overlay
    onPressOverlay?: () => void; // e.g., cancel handler
    variant?: 'fullscreen' | 'inline';
};

const SPINNER_SIZE = 80;

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    title = 'Loading',
    subtitle,
    progress = null,
    blocking = true,
    onPressOverlay,
    variant = 'fullscreen',
}) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        );
        if (visible) {
            loop.start();
        }
        return () => {
            loop.stop();
            rotation.setValue(0);
        };
    }, [visible, rotation]);

    const rotateStyle = useMemo(
        () => ({ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }),
        [rotation]
    );

    if (!visible) return null;

    const containerStyle =
        variant === 'fullscreen'
            ? [styles.absoluteFill, styles.fullscreen]
            : [styles.inline];

    const overlayContent = (
        <View style={styles.card}>
            <View style={styles.spinnerWrapper}>
                <View style={styles.spinnerTrack} />
                <Animated.View style={[styles.spinnerArc, rotateStyle]} />
                {typeof progress === 'number' && (
                    <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                )}
            </View>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );

    if (variant === 'inline') {
        return <View style={containerStyle}>{overlayContent}</View>;
    }

    return (
        <View
            style={containerStyle}
            pointerEvents={blocking ? 'auto' : 'box-none'}
        >
            {onPressOverlay ? (
                <TouchableWithoutFeedback onPress={onPressOverlay}>
                    <View style={styles.touchFill} />
                </TouchableWithoutFeedback>
            ) : (
                <View style={styles.touchFill} />
            )}
            {overlayContent}
        </View>
    );
};

const styles = StyleSheet.create({
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullscreen: {
        backgroundColor: COLORS.overlay,
        padding: SIZES.lg,
        zIndex: 999,
    },
    inline: {
        backgroundColor: 'transparent',
        paddingVertical: SIZES.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchFill: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: Math.min(SIZES.width * 0.85, 420),
        paddingVertical: SIZES.xl,
        paddingHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusXl,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    spinnerWrapper: {
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        marginBottom: SIZES.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerTrack: {
        position: 'absolute',
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        borderRadius: SPINNER_SIZE / 2,
        borderWidth: 6,
        borderColor: '#201a14',
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    spinnerArc: {
        position: 'absolute',
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        borderRadius: SPINNER_SIZE / 2,
        borderTopColor: COLORS.primary,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderWidth: 6,
    },
    progressText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.h5,
        fontWeight: '600',
    },
    title: {
        color: COLORS.primary,
        fontSize: SIZES.h3,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: SIZES.sm,
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        textAlign: 'center',
    },
});

export default LoadingOverlay;


