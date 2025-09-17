import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { baziApi, FamousPerson as ApiFamousPerson } from '../services/api';
import { useLoading } from '../components/LoadingProvider';
import FamousCard from '../components/FamousCard';
import FamousDetailSheet from '../components/FamousDetailSheet';

type FamousPerson = ApiFamousPerson;

const PAGE_SIZE = 20;

const FamousScreen = () => {
  const [people, setPeople] = useState<FamousPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<FamousPerson[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { show, hide } = useLoading();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      setLoading(true);
      show({ title: 'Loading Famous People', subtitle: 'Discovering legendary personalities...', blocking: true });
      const [page, cats] = await Promise.all([
        baziApi.getFamousPersons({ limit: PAGE_SIZE, offset: 0 }),
        baziApi.getFamousCategories(),
      ]);
      setPeople(page.data || []);
      setOffset(page.data.length);
      setHasMore(page.data.length < (page.total || 0));
      setCategories(cats.categories || []);
    } catch (error) {
      console.error('Error loading famous persons:', error);
      Alert.alert('Error', 'Failed to load famous persons data.');
    } finally {
      setLoading(false);
      hide();
    }
  };

  const fetchPeople = async (reset = false, opts: { search?: string; category?: string | null } = {}) => {
    const activeSearch = opts.search !== undefined ? opts.search : search;
    const activeCategory = opts.category !== undefined ? opts.category : selectedCategory;
    const nextOffset = reset ? 0 : offset;
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const res = await baziApi.getFamousPersons({
        limit: PAGE_SIZE,
        offset: nextOffset,
        search: activeSearch || undefined,
        category: activeCategory || undefined,
      });
      if (reset) setPeople(res.data || []);
      else setPeople(prev => [...prev, ...(res.data || [])]);
      const newOffset = nextOffset + (res.data?.length || 0);
      setOffset(newOffset);
      setHasMore(newOffset < (res.total || 0));
    } catch (e) {
      console.error('Failed to fetch people', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Debounced search inside Search Modal
  useEffect(() => {
    if (!searchVisible) return;
    if (!search) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await baziApi.getFamousPersons({ search, category: selectedCategory || undefined, limit: PAGE_SIZE, offset: 0 });
        setSearchResults(res.data || []);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchVisible, selectedCategory]);

  // When category changes (and not searching), refetch from server
  useEffect(() => {
    fetchPeople(true, { category: selectedCategory || null, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const renderPersonCard = ({ item }: { item: FamousPerson }) => (
    <View style={styles.cardWrapper}>
      <FamousCard
        name={item.name}
        category={item.category}
        bio={item.bio}
        imageUrl={item.image_url}
        onPress={() => {
          setActiveSlug(item.slug);
          setSheetVisible(true);
        }}
      />
    </View>
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
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setFilterVisible(true)}>
            <Ionicons name="filter" size={18} color={COLORS.text} />
            <Text style={styles.actionButtonText}>{selectedCategory ? selectedCategory : 'All'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setSearchVisible(true)}>
            <Ionicons name="search" size={18} color={COLORS.text} />
            <Text style={styles.actionButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={people}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id || item.slug}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => {
          if (!loadingMore && hasMore && !searchVisible) fetchPeople(false);
        }}
        onEndReachedThreshold={0.6}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: SIZES.lg }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : null}
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

      <FamousDetailSheet
        slug={activeSlug}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />

      {/* Filter dropdown modal */}
      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setFilterVisible(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Filter by Category</Text>
            <TouchableOpacity
              style={[styles.dropdownItem, !selectedCategory && styles.dropdownItemActive]}
              onPress={() => {
                setFilterVisible(false);
                setSelectedCategory(null);
              }}
            >
              <Text style={styles.dropdownItemText}>All</Text>
            </TouchableOpacity>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.dropdownItem, selectedCategory === c && styles.dropdownItemActive]}
                onPress={() => {
                  setFilterVisible(false);
                  setSelectedCategory(c);
                }}
              >
                <Text style={styles.dropdownItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search modal */}
      <Modal visible={searchVisible} transparent animationType="slide" onRequestClose={() => setSearchVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.searchSheetBackdrop}>
            <View style={styles.searchSheet}>
              <View style={styles.searchHeaderRow}>
                <Ionicons name="search" size={18} color={COLORS.textSecondary} />
                <TextInput
                  placeholder="Search famous people"
                  placeholderTextColor={COLORS.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  autoFocus
                />
                <TouchableOpacity onPress={() => { setSearch(''); setSearchVisible(false); }}>
                  <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              {searchLoading ? (
                <View style={{ paddingVertical: SIZES.lg }}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : search ? (
                searchResults.length === 0 ? (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No results for "{search}".</Text>
                    <TouchableOpacity
                      style={styles.tweetButton}
                      onPress={() => {
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`@bazigpt Please add a Bazi reading for "${search}"! #BaziGPT`)}`;
                        Linking.openURL(url);
                      }}
                    >
                      <Ionicons name="logo-twitter" size={18} color={COLORS.background} />
                      <Text style={styles.tweetButtonText}>Request reading on X</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id || item.slug}
                    renderItem={({ item }) => (
                      <View style={{ paddingHorizontal: SIZES.md, paddingBottom: SIZES.md }}>
                        <FamousCard
                          name={item.name}
                          category={item.category}
                          bio={item.bio}
                          imageUrl={item.image_url}
                          onPress={() => {
                            setActiveSlug(item.slug);
                            setSheetVisible(true);
                            setSearchVisible(false);
                          }}
                        />
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: SIZES.md }}
                  />
                )
              ) : (
                <View style={{ padding: SIZES.lg }}>
                  <Text style={styles.emptySubtitle}>Type a name to search famous personalities.</Text>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: SIZES.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: SIZES.caption,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Dropdown modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: SIZES.md,
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dropdownTitle: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    color: COLORS.textSecondary,
    fontSize: SIZES.caption,
  },
  dropdownItem: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.card,
  },
  dropdownItemText: {
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  listContainer: {
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  cardWrapper: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
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
  // Search sheet
  searchSheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  searchSheet: {
    maxHeight: '85%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    paddingTop: SIZES.md,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  noResults: {
    alignItems: 'center',
    gap: SIZES.md,
    padding: SIZES.lg,
  },
  noResultsText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  tweetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: 999,
  },
  tweetButtonText: {
    color: COLORS.background,
    fontWeight: '700',
  },
});

export default FamousScreen;
