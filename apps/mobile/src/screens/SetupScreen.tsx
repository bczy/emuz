import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const setupSteps: SetupStep[] = [
  {
    id: 1,
    title: 'Welcome to EmuZ',
    description: 'Your personal retro gaming library manager. Let\'s get you set up in just a few steps.',
    icon: '🎮',
  },
  {
    id: 2,
    title: 'Add Game Folders',
    description: 'Tell us where your ROM files are stored. We\'ll scan these folders to build your library.',
    icon: '📁',
  },
  {
    id: 3,
    title: 'Configure Emulators',
    description: 'We\'ll try to detect installed emulators automatically. You can also add them manually.',
    icon: '⚙️',
  },
  {
    id: 4,
    title: 'Choose Appearance',
    description: 'Customize how your library looks. You can always change this later in settings.',
    icon: '🎨',
  },
  {
    id: 5,
    title: 'You\'re All Set!',
    description: 'Your library is ready. Start playing your favorite retro games!',
    icon: '🚀',
  },
];

/**
 * Setup Screen - First-run wizard
 */
export default function SetupScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);

  const step = setupSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === setupSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Complete setup and go to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      {!isLastStep && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.stepIcon}>{step.icon}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>

        {/* Step-specific content */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Folder</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.detectedList}>
              <View style={styles.detectedItem}>
                <Text style={styles.detectedIcon}>✅</Text>
                <Text style={styles.detectedText}>RetroArch detected</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionCardSmall}>
              <Text style={styles.actionText}>Add Emulator</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.themeOptions}>
              <TouchableOpacity style={[styles.themeCard, styles.themeActive]}>
                <View style={styles.themePreviewDark} />
                <Text style={styles.themeLabel}>Dark</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.themeCard}>
                <View style={styles.themePreviewLight} />
                <Text style={styles.themeLabel}>Light</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.readyEmoji}>🎉</Text>
          </View>
        )}
      </View>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {setupSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.dotActive,
              index < currentStep && styles.dotComplete,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        {!isFirstStep ? (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepContent: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },
  actionCardSmall: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  detectedList: {
    width: '100%',
  },
  detectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
  },
  detectedIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  detectedText: {
    fontSize: 16,
    color: '#F1F5F9',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  themeCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeActive: {
    borderColor: '#10B981',
  },
  themePreviewDark: {
    width: 80,
    height: 120,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginBottom: 8,
  },
  themePreviewLight: {
    width: 80,
    height: 120,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  readyEmoji: {
    fontSize: 64,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#10B981',
    width: 24,
  },
  dotComplete: {
    backgroundColor: '#10B981',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backPlaceholder: {
    width: 80,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  nextButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
