import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Easing, PanResponder, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { baziApi, FamousPerson } from '../services/api';
import Markdown from './Markdown';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    slug: string | null;
    visible: boolean;
    onClose: () => void;
}

const SHEET_PEEK = 0;

const FamousDetailSheet: React.FC<Props> = ({ slug, visible, onClose }) => {
    const insets = useSafeAreaInsets();
    const [data, setData] = useState<FamousPerson | null>(null);
    const [loading, setLoading] = useState(false);
    const translateY = useRef(new Animated.Value(SIZES.height)).current; // sheet base translate
    const dragY = useRef(new Animated.Value(0)).current; // gesture delta
    const imageOpacity = useRef(new Animated.Value(0)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const [imageNaturalWidth, setImageNaturalWidth] = useState<number | null>(null);
    const [imageNaturalHeight, setImageNaturalHeight] = useState<number | null>(null);

    // Compute hero height that avoids cropping and caps within viewport
    const defaultHero = Math.round(SIZES.width * 9 / 16);
    const computedHero = imageNaturalWidth && imageNaturalHeight
        ? Math.round(SIZES.width * imageNaturalHeight / imageNaturalWidth)
        : defaultHero;
    const heroHeight = Math.max(defaultHero, Math.min(Math.round(SIZES.height * 0.55), computedHero));

    const scrollYRef = useRef(0);
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && scrollYRef.current <= 4,
            onPanResponderMove: (_, g) => {
                if (g.dy > 0) {
                    dragY.setValue(g.dy);
                } else {
                    const resisted = Math.max(-40, g.dy * 0.2);
                    dragY.setValue(resisted);
                }
            },
            onPanResponderRelease: (_, g) => {
                const shouldClose = g.dy > 120 || g.vy > 0.8;
                if (shouldClose) {
                    Animated.parallel([
                        Animated.timing(translateY, { toValue: SIZES.height, duration: 220, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
                        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
                    ]).start(() => {
                        dragY.setValue(0);
                        setData(null);
                        onClose();
                    });
                } else {
                    Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 12, speed: 16 }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            dragY.setValue(0);
            Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
            Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
            if (slug) load(slug);
        } else {
            Animated.timing(translateY, { toValue: SIZES.height, duration: 220, useNativeDriver: true, easing: Easing.in(Easing.cubic) }).start(() => {
                setData(null);
            });
            Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.in(Easing.cubic) }).start();
        }
    }, [visible, slug]);

    const load = async (targetSlug: string) => {
        try {
            setLoading(true);
            const result = await baziApi.getFamousPerson(targetSlug);
            setData(result);
            if (result?.image_url) {
                Image.getSize(result.image_url, (w, h) => {
                    setImageNaturalWidth(w);
                    setImageNaturalHeight(h);
                }, () => {
                    setImageNaturalWidth(null);
                    setImageNaturalHeight(null);
                });
            } else {
                setImageNaturalWidth(null);
                setImageNaturalHeight(null);
            }
            imageOpacity.setValue(0);
            Animated.timing(imageOpacity, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
        } catch (e) {
            // swallow errors; UI will show empty state
        } finally {
            setLoading(false);
        }
    };

    const title = data?.name || 'Loading…';

    // Shimmer setup for skeletons
    const shimmerValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const shouldAnimate = visible && (loading || !data);
        if (!shouldAnimate) return;
        shimmerValue.setValue(0);
        const animation = Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1100,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
        // Re-run when visibility/loading changes
    }, [visible, loading, data]);
    const shimmerTranslate = shimmerValue.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] });

    return (
        <View pointerEvents={visible ? 'auto' : 'none'} style={styles.root}>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={onClose} />
            </Animated.View>
            <Animated.View style={[
                styles.sheet,
                { top: insets.top + 10, transform: [{ translateY: Animated.add(translateY, dragY) }] },
            ]} {...panResponder.panHandlers}>
                <View style={styles.topChrome} pointerEvents="box-none">
                    <View style={styles.grabber} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    bounces
                    onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                        scrollYRef.current = e.nativeEvent.contentOffset.y;
                    }}
                    scrollEventThrottle={16}
                >
                    {(loading || !data) ? (
                        <>
                            <View style={[styles.heroWrapper, { height: heroHeight }]}>
                                <View style={[styles.heroImage, styles.heroPlaceholder]} />
                                <Animated.View pointerEvents="none" style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]}>
                                    <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.16)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
                                </Animated.View>
                                <LinearGradient
                                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.85)"]}
                                    locations={[0, 0.4, 0.75, 1]}
                                    style={styles.heroFade}
                                    pointerEvents="none"
                                />
                                <View style={styles.heroText}>
                                    <View style={[styles.skelLine, { width: '60%', height: 20, borderRadius: 6 }]} />
                                    <View style={[styles.skelLine, { width: 90, height: 12, marginTop: 8, borderRadius: 6 }]} />
                                </View>
                            </View>
                            <View style={[styles.infoRow, { marginTop: SIZES.md }]}>
                                <View style={[styles.skelPill, { width: 140 }]} />
                                <View style={[styles.skelPill, { width: 100 }]} />
                            </View>
                            <View style={styles.section}>
                                <View style={[styles.skelLine, { width: 120, height: 16, marginBottom: 10 }]} />
                                <View style={[styles.skelLine, { height: 12 }]} />
                                <View style={[styles.skelLine, { height: 12 }]} />
                                <View style={[styles.skelLine, { height: 12, width: '80%' }]} />
                            </View>
                            <View style={styles.section}>
                                <View style={[styles.skelLine, { width: 150, height: 16, marginBottom: 10 }]} />
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <View key={i} style={[styles.skelLine, { height: 12, width: i % 3 === 0 ? '92%' : '100%' }]} />
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={[styles.heroWrapper, { height: heroHeight }]}>
                                {data?.image_url ? (
                                    <Animated.Image source={{ uri: data.image_url }} style={[styles.heroImage, { opacity: imageOpacity }]} resizeMode="contain" />
                                ) : (
                                    <View style={[styles.heroImage, styles.heroPlaceholder]} />
                                )}
                                <LinearGradient
                                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.85)"]}
                                    locations={[0, 0.4, 0.75, 1]}
                                    style={styles.heroFade}
                                    pointerEvents="none"
                                />
                                <View style={styles.heroText}>
                                    <Text style={styles.heroName} numberOfLines={1}>{title}</Text>
                                    {!!data?.category && (
                                        <Text style={styles.heroCategory}>{data.category}</Text>
                                    )}
                                </View>
                            </View>
                            <View style={[styles.infoRow, { marginTop: SIZES.md }]}>
                                {!!data?.birth_date && (
                                    <View style={styles.infoPill}>
                                        <Ionicons name="calendar" size={16} color={COLORS.text} />
                                        <Text style={styles.infoText}>
                                            {(() => {
                                                try {
                                                    const d = data.birth_date.includes('T') ? parseISO(data.birth_date) : new Date(data.birth_date);
                                                    return format(d, 'PPP');
                                                } catch {
                                                    return data.birth_date;
                                                }
                                            })()}
                                        </Text>
                                    </View>
                                )}
                                {!!data?.birth_time && (
                                    <View style={styles.infoPill}>
                                        <Ionicons name="time" size={16} color={COLORS.text} />
                                        <Text style={styles.infoText}>{data.birth_time}</Text>
                                    </View>
                                )}
                            </View>

                            {!!data?.bio && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>About</Text>
                                    <Text style={styles.paragraph}>{data.bio}</Text>
                                </View>
                            )}

                            {!!data?.bazi_reading && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Bazi Reading</Text>
                                    <Markdown>{data.bazi_reading}</Markdown>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
        overflow: 'hidden',
    },
    heroWrapper: {
        width: '100%',
        backgroundColor: COLORS.card,
    },
    heroImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    heroPlaceholder: {
        backgroundColor: COLORS.card,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 220,
        opacity: 1,
    },
    heroFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '70%',
    },
    topChrome: {
        position: 'absolute',
        top: SIZES.sm,
        left: 0,
        right: 0,
        zIndex: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    grabber: {
        width: 44,
        height: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    closeBtnAbsolute: {
        position: 'absolute',
        right: SIZES.sm,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 8,
        borderRadius: 999,
    },
    heroText: {
        position: 'absolute',
        left: SIZES.md,
        right: SIZES.md,
        bottom: SIZES.md,
    },
    heroName: {
        color: COLORS.text,
        fontSize: SIZES.h3,
        fontWeight: '800',
        marginBottom: 4,
    },
    heroCategory: {
        color: COLORS.textSecondary,
        fontSize: SIZES.caption,
    },
    content: {
        padding: SIZES.lg,
        gap: SIZES.lg,
    },
    skelLine: {
        backgroundColor: COLORS.card,
        borderRadius: 8,
        height: 14,
        marginBottom: 10,
        overflow: 'hidden',
    },
    skelPill: {
        height: 26,
        backgroundColor: COLORS.card,
        borderRadius: 999,
    },
    infoRow: {
        flexDirection: 'row',
        gap: SIZES.sm,
        flexWrap: 'wrap',
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.card,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    infoText: {
        color: COLORS.text,
        fontSize: SIZES.small,
    },
    section: {
        gap: SIZES.sm,
    },
    sectionTitle: {
        color: COLORS.primary,
        fontSize: SIZES.h5,
        fontWeight: '700',
    },
    paragraph: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        lineHeight: 22,
    },
});

export default FamousDetailSheet;


