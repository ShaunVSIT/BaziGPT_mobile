import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.body}>{children}</Text>
    </View>
);

const AboutScreen: React.FC = () => {
    const content = (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>About BaziGPT</Text>
                <Text style={styles.subtitle}>AI-assisted Chinese Four Pillars readings</Text>
            </View>

            <Section title="What is BaziGPT?">
                BaziGPT provides personalized Bazi (Four Pillars) readings, compatibility insights, and daily forecasts.
            </Section>
            <Section title="How it works">
                Enter your birth date and time; we analyze the Four Pillars and summarize key insights, favorable elements, and timing.
            </Section>
            <Section title="Types of readings">
                Solo personal reading, compatibility analysis between two people, and daily personal forecasts.
                {"\n\n"}
                • Solo reading: Personalized insights based on your birth date and time.{"\n"}
                • Compatibility: Relationship analysis comparing two birth charts.{"\n"}
                • Daily forecast: Guidance aligned to today's Bazi energies.
            </Section>
            <Section title="What is BaZi (Four Pillars)?">
                BaZi is a traditional Chinese astrological system that interprets your birth date and time using four pillars—Year, Month, Day, and Hour—to reveal patterns about personality, timing and life themes.
            </Section>
            <Section title="The Five Elements">
                Wood, Fire, Earth, Metal and Water interact through cycles of creation and control. Your chart's element balance helps explain strengths, challenges and favorable timing.
            </Section>
            <Section title="Modern applications">
                BaZi can support decisions around career fit, relationships, strategic timing, and personal development. We present insights as guidance for reflection—not as deterministic fortune telling.
            </Section>
            <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={styles.link} onPress={() => Linking.openURL('https://www.bazigpt.io')}>Visit bazigpt.io</Text>
            </View>
            <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={styles.link} onPress={() => Linking.openURL('https://www.bazigpt.io/privacy')}>Privacy Policy</Text>
            </View>
            <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={styles.link} onPress={() => Linking.openURL('https://www.bazigpt.io/terms')}>Terms of Service</Text>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        paddingHorizontal: SIZES.md,
        paddingTop: SIZES.md,
        paddingBottom: SIZES.sm,
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
    },
    card: {
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        marginHorizontal: SIZES.md,
        marginVertical: SIZES.sm,
        padding: SIZES.md,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: 'rgba(255, 165, 0, 0.2)',
    },
    cardTitle: {
        fontSize: SIZES.h4,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    body: {
        color: COLORS.text,
        lineHeight: 22,
        fontSize: SIZES.body,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '700',
    }
});

export default AboutScreen;


