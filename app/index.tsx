import React, { useState } from 'react';
import VideoIntro from '../components/intro/VideoIntro';
import { Redirect } from 'expo-router';

export default function Index() {
  const [introFinished, setIntroFinished] = useState(false);

  if (introFinished) {
    return <Redirect href="/onboarding" />;
  }

  return <VideoIntro onFinish={() => setIntroFinished(true)} />;
}
