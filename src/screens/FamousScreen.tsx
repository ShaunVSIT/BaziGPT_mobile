import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { baziApi } from '../services/api';
import { useLoading } from '../components/LoadingProvider';

interface FamousPerson {
  id: string;
  name: string;
  category: string;
  description: string;
  slug: string;
}

const FamousScreen = () => {
  const [famousPersons, setFamousPersons] = useState<FamousPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { show, hide } = useLoading();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      show({ title: 'Loading Famous People', subtitle: 'Discovering legendary personalities...', blocking: true });
      const [personsResponse, categoriesResponse] = await Promise.all([
        baziApi.getFamousPersons({ limit: 50 }),
        baziApi.getFamousCategories(),
      ]);

      setFamousPersons(personsResponse.data || []);
      setCategories(categoriesResponse.categories || []);
    } catch (error) {
      console.error('Error loading famous persons:', error);
      Alert.alert('Error', 'Failed to load famous persons data.');
    } finally {
      setLoading(false);
      hide();
    }
  };

  const filteredPersons = selectedCategory
    ? famousPersons.filter(person => person.category === selectedCategory)
    : famousPersons;

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          !selectedCategory && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedCategory(null)}
      >
        <Text
          style={[
            styles.filterButtonText,
            !selectedCategory && styles.filterButtonTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.filterButton,
            selectedCategory === category && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedCategory === category && styles.filterButtonTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPersonCard = ({ item }: { item: FamousPerson }) => (
    <TouchableOpacity style={styles.personCard}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personCategory}>{item.category}</Text>
        <Text style={styles.personDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading famous charts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Famous Bazi Charts</Text>
        <Text style={styles.subtitle}>
          Explore the destiny charts of famous personalities
        </Text>
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={filteredPersons}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id || item.slug}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Famous Persons</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for more famous personality charts.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: SIZES.lg,
    alignItems: 'center',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  listContainer: {
    padding: SIZES.md,
  },
  personCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  personCategory: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  personDescription: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FamousScreen;
