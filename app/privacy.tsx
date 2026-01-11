import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../lib/design';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <ArrowLeft color={colors.textPrimary} size={20} />
        <Text style={{
          marginLeft: spacing.sm,
          fontSize: 15,
          color: colors.textPrimary,
        }}>
          Back
        </Text>
      </Pressable>

      {/* Title */}
      <Text style={{
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
      }}>
        Privacy Policy
      </Text>
      <Text style={{
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: spacing.lg,
      }}>
        Last updated: January 2025
      </Text>

      {/* Content */}
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Section title="Overview">
          Mebro is a fact-checking service that helps you verify claims using AI and credible sources. We take your privacy seriously and are committed to protecting your personal information.
        </Section>

        <Section title="Information We Collect">
          <BulletPoint>Claims and queries you submit for fact-checking</BulletPoint>
          <BulletPoint>Email address (if you create an account)</BulletPoint>
          <BulletPoint>Usage data (number of fact-checks performed)</BulletPoint>
          <BulletPoint>Device information for app functionality</BulletPoint>
        </Section>

        <Section title="How We Use Your Information">
          <BulletPoint>Process your claims through our AI fact-checking system</BulletPoint>
          <BulletPoint>Generate shareable links for fact-check results</BulletPoint>
          <BulletPoint>Track usage to enforce daily limits by tier</BulletPoint>
          <BulletPoint>Improve our service through anonymized analytics</BulletPoint>
          <BulletPoint>Send account-related communications (if registered)</BulletPoint>
        </Section>

        <Section title="AI Processing">
          Your claims are processed using large language models (AI) to research and verify information. The AI searches credible sources to provide verdicts. We do not use your personal claims to train AI models.
        </Section>

        <Section title="Data Sharing">
          <BulletPoint>We do not sell your personal data</BulletPoint>
          <BulletPoint>Fact-check results may be shared via public links you create</BulletPoint>
          <BulletPoint>We use Supabase for secure data storage</BulletPoint>
          <BulletPoint>Payment processing is handled by Apple/Google (no card data stored)</BulletPoint>
        </Section>

        <Section title="Data Retention">
          <BulletPoint>Fact-check results are stored indefinitely for sharing</BulletPoint>
          <BulletPoint>Account data is retained until you request deletion</BulletPoint>
          <BulletPoint>Usage logs are retained for 90 days</BulletPoint>
        </Section>

        <Section title="Your Rights">
          <BulletPoint>Access your personal data</BulletPoint>
          <BulletPoint>Request deletion of your account and data</BulletPoint>
          <BulletPoint>Export your fact-check history</BulletPoint>
          <BulletPoint>Opt out of non-essential communications</BulletPoint>
        </Section>

        <Section title="Security">
          We use industry-standard security measures including encryption in transit (HTTPS) and at rest. Authentication is handled securely through Supabase Auth.
        </Section>

        <Section title="Children's Privacy">
          Mebro is not intended for users under 13 years of age. We do not knowingly collect information from children.
        </Section>

        <Section title="Changes to This Policy">
          We may update this policy from time to time. Continued use of Mebro after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="Contact Us" isLast>
          For privacy questions or data requests, contact us at privacy@mebro.app
        </Section>
      </View>
    </ScrollView>
  );
}

function Section({ title, children, isLast }: { title: string; children: React.ReactNode; isLast?: boolean }) {
  return (
    <View style={{ marginBottom: isLast ? 0 : spacing.lg }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      }}>
        {title}
      </Text>
      {typeof children === 'string' ? (
        <Text style={{
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSecondary,
        }}>
          {children}
        </Text>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
}

function BulletPoint({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
      <Text style={{ color: colors.textMuted, marginRight: spacing.sm }}>•</Text>
      <Text style={{
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
        color: colors.textSecondary,
      }}>
        {children}
      </Text>
    </View>
  );
}
