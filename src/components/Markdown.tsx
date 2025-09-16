import React from 'react';
import MarkdownDisplay from 'react-native-markdown-display';
import { StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface MarkdownProps {
    children: string | null | undefined;
    align?: 'left' | 'center';
}

const Markdown: React.FC<MarkdownProps> = ({ children, align = 'left' }) => {
    if (!children) return null;
    return (
        <View style={[styles.container, align === 'center' && styles.center]}>
            <MarkdownDisplay style={mdStyles}>
                {children}
            </MarkdownDisplay>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    center: {
        alignSelf: 'center',
    },
});

// Styles roughly matching the web markdown rendering
const mdStyles = StyleSheet.create({
    body: {
        color: COLORS.text,
        fontSize: SIZES.body,
        lineHeight: 24,
    },
    heading1: {
        color: COLORS.primary,
        fontSize: SIZES.h5,
        fontWeight: '700',
        marginTop: SIZES.sm,
        marginBottom: SIZES.xs,
    },
    heading2: {
        color: COLORS.primary,
        fontSize: SIZES.h5,
        fontWeight: '700',
        marginTop: SIZES.sm,
        marginBottom: SIZES.xs,
    },
    heading3: {
        color: COLORS.primary,
        fontSize: SIZES.h6,
        fontWeight: '700',
        marginTop: SIZES.sm,
        marginBottom: SIZES.xs,
    },
    strong: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    bullet_list: {
        marginBottom: SIZES.sm,
    },
    ordered_list: {
        marginBottom: SIZES.sm,
    },
    list_item: {
        marginBottom: 4,
    },
    paragraph: {
        marginTop: 0,
        marginBottom: SIZES.sm,
    },
});

export default Markdown;


