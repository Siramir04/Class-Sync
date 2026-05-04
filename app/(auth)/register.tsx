import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Tag } from '../../components/ui/Tag';
import * as LucideIcons from 'lucide-react-native';
import { NIGERIAN_UNIVERSITIES, University } from '../../constants/universities';
import { registerUser, getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { Validation } from '../../utils/validation';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { colors: Colors, typography } = useTheme();
  const setUser = useAuthStore((s) => s.setUser);

  // Step state
  const [step, setStep] = useState(1);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: step === 1 ? 0 : -width,
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();
  }, [step]);

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
    if (!Validation.email(email)) {
      setError('Invalid email address format');
      return;
    }
    if (!Validation.username(username)) {
      setError('Username: 3-20 chars, letters/numbers/underscore only');
      return;
    }
    if (!Validation.password(password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!selectedUniversity || !department.trim()) {
      setError('Please select your university and department');
      return;
    }
    if (!Validation.entryYear(entryYear)) {
      setError('Entry year must be between 2020 and 2030');
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
    } catch (err: unknown) {
        const error = err as { message: string };
        Alert.alert('Registration Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(Colors, typography);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthLayout 
        title={step === 1 ? "Start your\njourney." : "Almost\nthere."}
        subtitle={step === 1 ? "Step 1: Your Profile" : "Step 2: University Details"}
      >
        <View style={styles.formContainer}>
          {/* M3 Progress Indicator */}
          <View style={styles.progressContainer}>
              <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
              <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
               <LucideIcons.AlertCircle size={16} color={Colors.onErrorContainer} />
               <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Animated.View style={[styles.stepsWrapper, { transform: [{ translateX: slideAnim }] }]}>
            {/* STEP 1 */}
            <View style={styles.stepPage}>
               <View style={styles.inputs}>
                  <Input label="Full Name" placeholder="e.g. John Doe" value={fullName} onChangeText={setFullName} />
                  <Input label="Email Address" placeholder="university@email.edu" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                  <Input label="Username" placeholder="e.g. john_sync" value={username} onChangeText={setUsername} autoCapitalize="none" />
                  <View>
                      <Input label="Password" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                      <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                        <LucideIcons.Eye size={20} color={showPassword ? Colors.primary : Colors.onSurfaceVariant} />
                      </Pressable>
                  </View>
               </View>

               <Button label="Continue" onPress={handleNextStep} style={styles.submitBtn} />

               <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.signupText}>Sign in</Text>
                </Pressable>
              </View>
            </View>

            {/* STEP 2 */}
            <View style={styles.stepPage}>
               <Pressable onPress={() => setStep(1)} style={styles.backLink}>
                  <LucideIcons.ArrowLeft size={16} color={Colors.primary} />
                  <Text style={styles.backLinkText}>Go back to step 1</Text>
               </Pressable>

               <View style={styles.inputs}>
                  <View style={styles.searchSection}>
                     <Input
                        label="University Name"
                        placeholder="Search your school..."
                        value={universityQuery}
                        onChangeText={handleUniversitySearch}
                     />
                     {universityResults.length > 0 && (
                        <View style={styles.dropdown}>
                           {universityResults.map((u, i) => (
                              <Pressable key={i} style={styles.resultRow} onPress={() => handleSelectUniversity(u)}>
                                 <Text style={styles.resultName}>{u.name}</Text>
                                 <Tag label={u.type} type={u.type as any} />
                              </Pressable>
                           ))}
                        </View>
                     )}
                  </View>

                  <Input label="Department" placeholder="e.g. Computer Science" value={department} onChangeText={setDepartment} />

                  <View style={styles.roleSection}>
                     <Text style={styles.roleLabel}>I am a...</Text>
                     <View style={styles.roleGrid}>
                        {['student', 'monitor', 'lecturer'].map((r) => (
                           <Pressable
                              key={r}
                              onPress={() => setRole(r as any)}
                              style={[styles.rolePill, role === r && styles.rolePillActive]}
                           >
                              <Text style={[styles.rolePillText, role === r && styles.rolePillTextActive]}>
                                 {r.charAt(0).toUpperCase() + r.slice(1)}
                              </Text>
                           </Pressable>
                        ))}
                     </View>
                  </View>

                  <Input label="Entry Year" placeholder="e.g. 2024" value={entryYear} onChangeText={setEntryYear} keyboardType="numeric" maxLength={4} />
               </View>

               <Button label="Create Account" onPress={handleRegister} loading={loading} style={styles.submitBtn} />

               <View style={styles.termsFooter}>
                <Text style={styles.termsText}>
                  By continuing you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </AuthLayout>
    </KeyboardAvoidingView>
  );
}

const createStyles = (Colors: any, typography: any) => StyleSheet.create({
  formContainer: {
    marginTop: 0,
    overflow: 'hidden',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.outlineVariant,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.outlineVariant,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.errorContainer,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  errorText: {
    ...typography.m3.labelLarge,
    color: Colors.onErrorContainer,
    fontWeight: '700',
  },
  stepsWrapper: {
    flexDirection: 'row',
    width: width * 2,
  },
  stepPage: {
    width: width - 48, // Accounting for AuthLayout padding
    marginRight: 48,
  },
  inputs: {
    gap: 8,
    marginBottom: 24,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 20,
  },
  submitBtn: {
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
  },
  footerText: {
    ...typography.m3.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  signupText: {
    ...typography.m3.labelLarge,
    color: Colors.primary,
    fontWeight: '900',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backLinkText: {
    ...typography.m3.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  searchSection: {
    zIndex: 100,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 4,
    zIndex: 1000,
  },
  resultRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
  },
  resultName: {
    ...typography.m3.bodyMedium,
    color: Colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  roleSection: {
    marginVertical: 8,
  },
  roleLabel: {
    ...typography.m3.labelLarge,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
    fontWeight: '700',
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  rolePill: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevation1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  rolePillActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primary,
  },
  rolePillText: {
    ...typography.m3.labelLarge,
    color: Colors.onSurfaceVariant,
  },
  rolePillTextActive: {
    color: Colors.onPrimaryContainer,
    fontWeight: '900',
  },
  termsFooter: {
    marginTop: 32,
    alignItems: 'center',
  },
  termsText: {
    ...typography.m3.labelSmall,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
