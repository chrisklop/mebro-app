import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Eye, FileText, ChevronLeft, Crown, Star, Award, Shield, Gem, Sparkles } from 'lucide-react-native';
import { API_BASE } from '../lib/constants';
import { colors, spacing, borderRadius } from '../lib/design';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalViews: number;
  claimsShared: number;
  tier: {
    name: string;
    color: string;
    bgColor: string;
  };
}

interface MyStats {
  displayName: string;
  totalViews: number;
  claimsShared: number;
  tier: {
    name: string;
    color: string;
    bgColor: string;
  };
  nextTier: {
    name: string;
    minViews: number;
  } | null;
  progressToNextTier: number;
  viewsToNextTier: number;
  rank: number;
}

// Tier icons map
const getTierIcon = (tierName: string, size: number = 16, color: string = colors.textMuted) => {
  const iconProps = { size, color };
  switch (tierName) {
    case 'Curious Bro': return <Eye {...iconProps} />;
    case 'Fact Finder': return <FileText {...iconProps} />;
    case 'Truth Seeker': return <Star {...iconProps} />;
    case 'Enlightened Bro': return <Award {...iconProps} />;
    case 'Myth Buster': return <Shield {...iconProps} />;
    case 'Truth Sage': return <Gem {...iconProps} />;
    case 'Reality Guardian': return <Crown {...iconProps} />;
    default: return <Eye {...iconProps} />;
  }
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, myStatsRes] = await Promise.all([
          fetch(`${API_BASE}/leaderboard`),
          fetch(`${API_BASE}/sharers/me`),
        ]);

        const leaderboardData = await leaderboardRes.json();
        const myStatsData = await myStatsRes.json();

        if (leaderboardData.success) {
          setLeaderboard(leaderboardData.leaderboard);
        }

        if (myStatsData.success) {
          setMyStats(myStatsData.sharer);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { color: '#f59e0b', icon: <Crown size={20} color="#f59e0b" /> };
    if (rank === 2) return { color: '#9ca3af', icon: <Award size={20} color="#9ca3af" /> };
    if (rank === 3) return { color: '#cd7f32', icon: <Award size={20} color="#cd7f32" /> };
    return { color: colors.textMuted, icon: null };
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg }}>
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}
        >
          <ChevronLeft size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Trophy size={28} color="#f59e0b" />
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.textPrimary }}>
              Truth Sharers
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
            Top fact-checkers spreading truth across the web
          </Text>
        </View>

        {/* My Stats Card */}
        {myStats && (
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: myStats.tier.bgColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {getTierIcon(myStats.tier.name, 20, myStats.tier.color)}
                </View>
                <View>
                  <Text style={{ fontWeight: '700', color: colors.textPrimary, fontSize: 16 }}>
                    {myStats.displayName}
                  </Text>
                  <Text style={{ fontSize: 14, color: myStats.tier.color }}>
                    {myStats.tier.name}
                  </Text>
                </View>
              </View>
              {myStats.rank > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Your Rank</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary }}>
                    #{myStats.rank}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
              <View style={{ flex: 1, backgroundColor: colors.backgroundAlt, borderRadius: borderRadius.md, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <Eye size={14} color={colors.textMuted} />
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Total Views</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                  {myStats.totalViews.toLocaleString()}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.backgroundAlt, borderRadius: borderRadius.md, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <FileText size={14} color={colors.textMuted} />
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Facts Shared</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                  {myStats.claimsShared}
                </Text>
              </View>
            </View>

            {/* Progress to next tier */}
            {myStats.nextTier && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Progress to {myStats.nextTier.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textPrimary, fontWeight: '500' }}>
                    {myStats.viewsToNextTier} views to go
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.backgroundAlt, borderRadius: 4, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${myStats.progressToNextTier}%`,
                      backgroundColor: myStats.tier.color,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Leaderboard */}
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}>
          <View style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{ fontWeight: '700', color: colors.textPrimary }}>Top Truth Sharers</Text>
          </View>

          {leaderboard.length === 0 ? (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Sparkles size={32} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                No truth sharers yet. Be the first!
              </Text>
              <Pressable
                onPress={() => router.push('/')}
                style={{
                  marginTop: spacing.md,
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.md,
                }}
              >
                <Text style={{ color: colors.textOnDark, fontWeight: '600' }}>Check a Fact</Text>
              </Pressable>
            </View>
          ) : (
            leaderboard.map((entry, index) => {
              const rankDisplay = getRankDisplay(entry.rank);
              return (
                <View
                  key={entry.rank}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    backgroundColor: entry.rank <= 3 ? 'rgba(184, 173, 143, 0.3)' : 'transparent',
                    borderBottomWidth: index < leaderboard.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border + '50',
                  }}
                >
                  {/* Rank */}
                  <View style={{ width: 40, alignItems: 'center' }}>
                    {rankDisplay.icon || (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMuted }}>
                        #{entry.rank}
                      </Text>
                    )}
                  </View>

                  {/* Avatar & Name */}
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: entry.tier.bgColor,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {getTierIcon(entry.tier.name, 16, entry.tier.color)}
                    </View>
                    <View>
                      <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
                        {entry.displayName}
                      </Text>
                      <Text style={{ fontSize: 12, color: entry.tier.color }}>
                        {entry.tier.name}
                      </Text>
                    </View>
                  </View>

                  {/* Stats */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                      {entry.totalViews.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>views</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Tier Legend */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}>
            Tier Levels
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {[
              { name: 'Curious Bro', views: '0+', color: '#6b7280' },
              { name: 'Fact Finder', views: '10+', color: '#cd7f32' },
              { name: 'Truth Seeker', views: '50+', color: '#9ca3af' },
              { name: 'Enlightened Bro', views: '200+', color: '#f59e0b' },
              { name: 'Myth Buster', views: '500+', color: '#a78bfa' },
              { name: 'Truth Sage', views: '1K+', color: '#60a5fa' },
              { name: 'Reality Guardian', views: '5K+', color: '#8b5cf6' },
            ].map((tier) => (
              <View
                key={tier.name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: tier.color }} />
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textPrimary }}>
                    {tier.name}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.textMuted }}>{tier.views}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing.xxl }} />
      </View>
    </ScrollView>
  );
}
