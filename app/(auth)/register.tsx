import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormGroup } from '../../components/ui/FormGroup';
import { FormRow } from '../../components/ui/FormRow';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Tag';
import * as LucideIcons from 'lucide-react-native';
import { NIGERIAN_UNIVERSITIES, University } from '../../constants/universities';
import { registerUser, getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 state
  const [universityQuery, setUniversityQuery] = useState('');
  const [universityResults, setUniversityResults] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [entryYear, setEntryYear] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUniversitySearch = (text: string) => {
    setUniversityQuery(text);
    if (text.length === 0) {
      setUniversityResults([]);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = NIGERIAN_UNIVERSITIES.filter(u =>
      u.name.toLowerCase().includes(lower) ||
      (u.shortName?.toLowerCase().includes(lower))
    ).slice(0, 6);
    setUniversityResults(filtered);
  };

  const handleSelectUniversity = (univ: University) => {
    setSelectedUniversity(univ);
    setUniversityQuery(univ.name);
    setUniversityResults([]);
  };

  const handleNextStep = () => {
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!selectedUniversity || !department.trim() || !entryYear.trim()) {
      setError('Please fill in all details');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const firebaseUser = await registerUser(
        fullName, 
        email, 
        username,
        selectedUniversity.name, 
        role, 
        password
      );
      const userData = await getCurrentUser(firebaseUser.uid);
      
      setUser(userData);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepCircle, step >= 1 ? styles.stepCircleActive : styles.stepCircleIdle]}>
        {step > 1 ? (
          <LucideIcons.Check size={14} color="white" />
        ) : (
          <Text style={[styles.stepNumber, step === 1 ? styles.stepNumberActive : styles.stepNumberIdle]}>1</Text>
        )}
      </View>
      <View style={[styles.stepLine, step > 1 ? styles.stepLineActive : styles.stepLineIdle]} />
      <View style={[styles.stepCircle, step === 2 ? styles.stepCircleActive : styles.stepCircleIdle]}>
        <Text style={[styles.stepNumber, step === 2 ? styles.stepNumberActive : styles.stepNumberIdle]}>2</Text>
      </View>
    </View>
  );

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <Text>{text}</Text>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
          <Text key={i} style={{ fontWeight: '700', color: Colors.accentBlue }}>{part}</Text> : 
          part
        )}
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthLayout 
        title={step === 1 ? "Create your\naccount." : "Your university\ndetails."}
        subtitle={step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
      >
        <View style={styles.formContainer}>
          {renderStepIndicator()}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <>
              <FormGroup>
                <FormRow 
                  placeholder="Full name"
                  icon="User"
                  iconBg="#EFF6FF"
                  iconColor={Colors.accentBlue}
                  value={fullName}
                  onChangeText={setFullName}
                />
                <FormRow 
                  placeholder="Email address"
                  icon="Mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <FormRow 
                  placeholder="Username (e.g. john_doe)"
                  icon="AtSign"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <FormRow 
                  placeholder="Min. 8 characters"
                  icon="Lock"
                  isLast
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightElement={
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <LucideIcons.Eye 
                        size={20} 
                        color={Colors.textTertiary} 
                        style={{ opacity: 0.3 }} 
                      />
                    </Pressable>
                  }
                />
              </FormGroup>

              <View style={{ paddingHorizontal: 14, marginTop: 20 }}>
                <Button 
                  label="Continue →" 
                  onPress={handleNextStep}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.signupText}>Sign in</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Pressable 
                onPress={() => setStep(1)} 
                style={styles.backButtonRow}
              >
                <View style={styles.backButton}>
                  <LucideIcons.ChevronLeft size={20} color={Colors.accentBlue} />
                </View>
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>

              <View style={styles.searchContainer}>
                <View style={[styles.searchField, { borderColor: Colors.accentBlue }]}>
                  <View style={styles.searchIconOuter}>
                    <LucideIcons.Search size={18} color={Colors.accentBlue} />
                  </View>
                  <FormRow 
                    placeholder="Search your university..."
                    value={universityQuery}
                    onChangeText={handleUniversitySearch}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    // Custom search field doesn't use standard FormRow labels but uses its body
                  />
                </View>

                {universityResults.length > 0 && (
                  <View style={styles.resultsDropdown}>
                    {universityResults.map((u, i) => (
                      <Pressable 
                        key={i} 
                        style={styles.resultRow}
                        onPress={() => handleSelectUniversity(u)}
                      >
                        <Text style={styles.resultName}>{highlightMatch(u.name, universityQuery)}</Text>
                        <Tag 
                          label={u.type} 
                          type={u.type === 'federal' ? 'federal' : u.type === 'state' ? 'state' : 'private'} 
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.sectionLabel}>Role & year</Text>
              <FormGroup>
                <FormRow 
                  label="Department"
                  icon="BookOpen"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChangeText={setDepartment}
                />
                <View style={styles.roleSelectorRow}>
                  <Pressable 
                    onPress={() => setRole('student')}
                    style={[styles.rolePill, role === 'student' && styles.rolePillActive]}
                  >
                    <Text style={[styles.rolePillText, role === 'student' && styles.rolePillTextActive]}>Student</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setRole('monitor')}
                    style={[styles.rolePill, role === 'monitor' && styles.rolePillActive]}
                  >
                    <Text style={[styles.rolePillText, role === 'monitor' && styles.rolePillTextActive]}>Monitor</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setRole('lecturer')}
                    style={[styles.rolePill, role === 'lecturer' && styles.rolePillActive]}
                  >
                    <Text style={[styles.rolePillText, role === 'lecturer' && styles.rolePillTextActive]}>Lecturer</Text>
                  </Pressable>
                </View>
                <FormRow 
                  label="Entry year"
                  icon="Calendar"
                  isLast
                  placeholder="e.g. 2023"
                  value={entryYear}
                  onChangeText={setEntryYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </FormGroup>

              <View style={{ paddingHorizontal: 14, marginTop: 24 }}>
                <Button 
                  label="Create my account" 
                  onPress={handleRegister} 
                  loading={loading}
                  variant="navy"
                />
              </View>

              <View style={styles.termsFooter}>
                <Text style={styles.termsText}>
                  By continuing you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>
            </>
          )}
        </View>
      </AuthLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingTop: 0,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 14,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.accentBlue,
  },
  stepCircleIdle: {
    backgroundColor: '#E5E5EA',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepNumberIdle: {
    color: Colors.textTertiary,
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepLineActive: {
    backgroundColor: Colors.accentBlue,
  },
  stepLineIdle: {
    backgroundColor: '#E5E5EA',
  },
  errorBanner: {
    marginHorizontal: 14,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.errorSoft,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  backButton: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    fontSize: 14,
    color: Colors.accentBlue,
    fontWeight: '500',
  },
  searchContainer: {
    marginHorizontal: 14,
    marginBottom: 20,
    zIndex: 100,
  },
  searchField: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  searchIconOuter: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  resultsDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  resultRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  resultName: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingLeft: 18,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
  },
  rolePill: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillActive: {
    backgroundColor: '#EFF6FF',
  },
  rolePillText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  rolePillTextActive: {
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  termsFooter: {
    padding: 24,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 18,
    textAlign: 'center',
  },
  linkText: {
    color: Colors.accentBlue,
    fontWeight: '600',
  },
});
