import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export interface FamousCardProps {
    name: string;
    category?: string;
    bio?: string;
    imageUrl?: string;
    onPress?: () => void;
}

const FamousCard: React.FC<FamousCardProps> = ({ name, category, bio, imageUrl, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
            <View style={styles.mediaWrapper}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]} />
                )}
                <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
                    style={styles.overlay}
                />
                <View style={styles.topRow}>
                    {category ? (
                        <View style={styles.chip}>
                            <Ionicons name="pricetag" size={14} color={COLORS.text} />
                            <Text style={styles.chipText}>{category}</Text>
                        </View>
                    ) : null}
                </View>
                <View style={styles.bottomArea}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    {bio ? (
                        <Text style={styles.caption} numberOfLines={2}>{bio}</Text>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    mediaWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        position: 'relative',
        backgroundColor: COLORS.card,
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        borderRadius: SIZES.radiusLg,
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '55%',
        borderBottomLeftRadius: SIZES.radiusLg,
        borderBottomRightRadius: SIZES.radiusLg,
    },
    topRow: {
        position: 'absolute',
        top: SIZES.sm,
        left: SIZES.sm,
        right: SIZES.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    chipText: {
        color: COLORS.text,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    bottomArea: {
        position: 'absolute',
        left: SIZES.md,
        right: SIZES.md,
        bottom: SIZES.md,
    },
    name: {
        color: COLORS.text,
        fontSize: SIZES.h4,
        fontWeight: '800',
        marginBottom: 4,
    },
    caption: {
        color: COLORS.textSecondary,
        fontSize: SIZES.caption,
        lineHeight: 20,
    },
});

export default FamousCard;


