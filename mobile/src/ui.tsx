import { createContext, useContext, useRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { moneyParts } from './format';

export const colors = {
  ink: '#192b42',
  muted: '#718096',
  line: '#e7edf4',
  blue: '#3269e8',
  navy: '#142740',
  green: '#188b67',
  orange: '#d88b35',
  red: '#b9574c',
  canvas: '#f4f7fb',
  white: '#ffffff',
};

export const ScrollVisibilityContext = createContext<(offset: number) => void>(() => undefined);

export function Page({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const reportScroll = useContext(ScrollVisibilityContext);
  const previousOffset = useRef(0);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = Math.max(0, event.nativeEvent.contentOffset.y);
    if (offset <= 8) reportScroll(0);
    else if (Math.abs(offset - previousOffset.current) > 4) reportScroll(offset - previousOffset.current);
    previousOffset.current = offset;
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.pageHeading}>
        <View style={styles.headingText}>
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.buttonSecondaryText,
          danger && styles.buttonDangerText,
          small && styles.buttonSmallText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry,
  multiline,
  required,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'decimal-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  required?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca8b7"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
      />
    </View>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.choice, value === option.value && styles.choiceSelected]}
          >
            <Text style={[styles.choiceText, value === option.value && styles.choiceTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function Notice({ children, success = false }: { children: ReactNode; success?: boolean }) {
  return <Text style={[styles.notice, success && styles.noticeSuccess]}>{children}</Text>;
}

export function Loading() {
  return <View style={styles.loading}><ActivityIndicator color={colors.blue} /><Text style={styles.loadingText}>Loading…</Text></View>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <Text style={styles.empty}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function MoneyText({
  value,
  amountStyle,
  currencyStyle,
}: {
  value: number | undefined | null;
  amountStyle?: object;
  currencyStyle?: object;
}) {
  const parts = moneyParts(value);
  return (
    <Text>
      <Text style={amountStyle}>{parts.amount}</Text>
      <Text style={[styles.currencyCode, currencyStyle]}> {parts.currency}</Text>
    </Text>
  );
}

export function Stat({
  label,
  value,
  accent = colors.blue,
  onPress,
}: {
  label: string;
  value: ReactNode;
  accent?: string;
  onPress?: () => void;
}) {
  const content = <><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, { color: accent }]}>{value}</Text></>;
  if (!onPress) return <View style={styles.stat}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${typeof value === 'string' || typeof value === 'number' ? value : 'Open details'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && styles.buttonPressed]}
    >
      {content}
    </Pressable>
  );
}

export function Row({
  title,
  detail,
  right,
  children,
}: {
  title: string;
  detail?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
        {children}
      </View>
      {right ? <View style={styles.rowRight}>{typeof right === 'string' ? <Text style={styles.rowRightText}>{right}</Text> : right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  pageContent: { padding: 18, paddingBottom: 34, gap: 14 },
  pageHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 },
  headingText: { flex: 1 },
  pageTitle: { color: colors.ink, fontWeight: '800', fontSize: 25, letterSpacing: -0.5 },
  pageSubtitle: { color: colors.muted, fontSize: 12, marginTop: 5, lineHeight: 18 },
  card: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 13, padding: 15, gap: 11 },
  button: { minHeight: 42, paddingHorizontal: 15, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blue },
  buttonSmall: { minHeight: 34, paddingHorizontal: 11 },
  buttonSecondary: { backgroundColor: '#eef3fc', borderWidth: 1, borderColor: '#dbe5f5' },
  buttonDanger: { backgroundColor: '#fff1ef', borderColor: '#f2dad6', borderWidth: 1 },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  buttonSecondaryText: { color: '#456185' },
  buttonDangerText: { color: colors.red },
  buttonSmallText: { fontSize: 10 },
  field: { gap: 6, flex: 1 },
  fieldLabel: { color: '#52647a', fontSize: 11, fontWeight: '700' },
  input: { minHeight: 43, borderWidth: 1, borderColor: '#dfe6ee', backgroundColor: '#fff', paddingHorizontal: 11, borderRadius: 8, color: colors.ink, fontSize: 13 },
  inputMultiline: { minHeight: 75, paddingTop: 10, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', gap: 7 },
  choice: { paddingHorizontal: 12, minHeight: 34, justifyContent: 'center', borderRadius: 18, backgroundColor: '#eef2f7', borderWidth: 1, borderColor: '#eef2f7' },
  choiceSelected: { backgroundColor: '#eaf0ff', borderColor: '#9cb7f3' },
  choiceText: { color: '#718096', fontSize: 10, fontWeight: '600' },
  choiceTextSelected: { color: colors.blue },
  notice: { borderWidth: 1, borderColor: '#f1d5d1', backgroundColor: '#fff5f3', color: '#a94f46', padding: 12, borderRadius: 8, fontSize: 11, lineHeight: 16 },
  noticeSuccess: { borderColor: '#cee8db', backgroundColor: '#f0faf5', color: colors.green },
  loading: { minHeight: 100, justifyContent: 'center', alignItems: 'center', gap: 9 },
  loadingText: { color: colors.muted, fontSize: 11 },
  empty: { textAlign: 'center', color: '#8996a6', padding: 19, fontSize: 11, lineHeight: 16 },
  sectionTitle: { color: '#31465f', fontSize: 14, fontWeight: '800', marginTop: 3 },
  stat: { flex: 1, minWidth: '45%', backgroundColor: '#fff', padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 12, gap: 8 },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  statValue: { fontSize: 21, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#eef1f5', paddingVertical: 11 },
  rowMain: { flex: 1, gap: 4 },
  rowTitle: { color: '#30445d', fontSize: 12, fontWeight: '700' },
  rowDetail: { color: '#8794a5', fontSize: 10, lineHeight: 15 },
  rowRight: { alignItems: 'flex-end' },
  rowRightText: { color: '#30445d', fontSize: 11, fontWeight: '800' },
  currencyCode: { fontSize: 9, color: colors.muted, fontWeight: '600' },
});

export const uiStyles = styles;
