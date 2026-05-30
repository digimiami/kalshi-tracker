import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import MetricCard, { COLORS } from '../components/MetricCard';
import { getPositions, getScanResults, getAITraderStatus, getCryptoPrices } from '../services/kalshiApi';
import { formatCurrency, formatPercent, formatPrice, getPnlColor, getSignalColor, getTimeAgo } from '../utils/format';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [positionData, setPositionData] = useState(null);
  const [scans, setScans] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const pos = await getPositions();
      const scan = await getScanResults();
      const ai = await getAITraderStatus();
      const crypto = await getCryptoPrices();

      setPositionData(pos);
      setBalance(pos.balance || 0);
      setScans(scan);
      setAiStatus(ai);
      setCryptoPrices(crypto);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading Kalshi data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Kalshi Tracker</Text>
        <Text style={styles.headerSub}>Crypto Prediction Monitor</Text>
        <View style={styles.divider} />

        {/* Balance Row */}
        <View style={styles.balanceRow}>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>BALANCE</Text>
            <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>PORTFOLIO</Text>
            <Text style={styles.balanceValue}>
              {positionData ? formatCurrency(positionData.portfolio_value) : '$0.00'}
            </Text>
          </View>
        </View>

        {/* P&L Summary */}
        {positionData && (
          <View style={styles.pnlSection}>
            <Text style={styles.sectionTitle}>P&L Summary</Text>
            <MetricCard
              title="Realized P&L"
              value={formatCurrency(positionData.realized_pnl || 0)}
              color={getPnlColor(positionData.realized_pnl || 0)}
              subtitle={`Cost basis: ${formatCurrency(positionData.cost_basis || 0)}`}
              style={{ width: '100%' }}
            />
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: '#00ff88' }]}>{positionData.winners || 0}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: '#ff4466' }]}>{positionData.losers || 0}</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: '#888899' }]}>{positionData.breakeven || 0}</Text>
                <Text style={styles.statLabel}>Even</Text>
              </View>
            </View>
          </View>
        )}

        {/* Crypto Prices */}
        {cryptoPrices && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crypto Spot</Text>
            {Object.entries(cryptoPrices).map(([asset, data]) => (
              <View key={asset} style={styles.assetRow}>
                <Text style={styles.assetName}>{asset}</Text>
                <Text style={styles.assetPrice}>{formatPrice(data.price)}</Text>
                <Text style={[styles.assetChange, { color: data.change24h >= 0 ? COLORS.success : COLORS.danger }]}>
                  {data.change24h ? formatPercent(data.change24h) : '—'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Market Scans */}
        {scans && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Scans</Text>
            {scans.assets.map((asset) => (
              <View key={asset.name} style={styles.assetRow}>
                <View style={styles.assetLeft}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetMktCount}>{asset.ticker}</Text>
                </View>
                <View>
                  <Text style={[styles.assetSignal, { color: getSignalColor(asset.signal) }]}>
                    {asset.signal.replace('_', ' ')}
                  </Text>
                  <Text style={styles.assetEdge}>{asset.best_edge !== '—' ? asset.best_edge : 'No edge'}</Text>
                </View>
              </View>
            ))}
            {scans.top_opportunities.length > 0 && (
              <View style={styles.oppSection}>
                <Text style={styles.sectionSubtitle}>Top Opportunities</Text>
                {scans.top_opportunities.map((opp, i) => (
                  <View key={i} style={styles.oppCard}>
                    <Text style={styles.oppTitle}>{opp.market}</Text>
                    <Text style={[styles.oppEdge, { color: COLORS.success }]}>Edge: {opp.edge}</Text>
                    <Text style={styles.oppDetail}>Confidence: {(opp.confidence * 100).toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI Trader Status */}
        {aiStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Trader</Text>
            <View style={styles.aiCard}>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Status</Text>
                <Text style={[styles.aiValue, { color: aiStatus.status === 'RUNNING' ? COLORS.success : COLORS.danger }]}>
                  ● {aiStatus.status}
                </Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Model</Text>
                <Text style={styles.aiValue}>{aiStatus.model}</Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Mode</Text>
                <Text style={[styles.aiValue, { color: aiStatus.mode === 'PAPER' ? COLORS.warning : COLORS.success }]}>
                  {aiStatus.mode}
                </Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Open Positions</Text>
                <Text style={styles.aiValue}>{aiStatus.open_positions}</Text>
              </View>
              <View style={styles.aiRow}>
                <Text style={styles.aiLabel}>Health</Text>
                <Text style={[styles.aiValue, { color: aiStatus.health_score < 50 ? COLORS.warning : COLORS.success }]}>
                  {aiStatus.health_score}/100
                </Text>
              </View>
              <Text style={styles.aiTimestamp}>Last scan: {getTimeAgo(aiStatus.last_decision)}</Text>
            </View>
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          Pull to refresh • Data updates every 30 min
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textDim,
    marginTop: 12,
    fontFamily: 'System',
    fontSize: 14,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerTitle: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
  },
  headerSub: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  balanceValue: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  pnlSection: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDim,
    marginBottom: 8,
    marginTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 6,
  },
  assetLeft: {},
  assetName: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  assetMktCount: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  assetPrice: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  assetChange: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
  },
  assetSignal: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  assetEdge: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  oppSection: {
    marginTop: 8,
  },
  oppCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff8822',
    padding: 14,
    marginBottom: 6,
  },
  oppTitle: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  oppEdge: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
  },
  oppDetail: {
    fontFamily: 'System',
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  aiLabel: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textDim,
  },
  aiValue: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiTimestamp: {
    fontFamily: 'System',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
  lastUpdated: {
    fontFamily: 'System',
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
  },
});
