import InputWizard from '@/components/InputWizard';

/**
 * app/page.tsx — RTI-GPT Main Entry Page
 * Deepan Kumar E S — Neural Ninjas (TEAM-008)
 *
 * This is the root page. It simply renders the InputWizard which owns
 * all 4-step state. No additional layout needed here — InputWizard
 * renders its own header/footer for a full-screen app feel.
 */
export default function Home() {
  return <InputWizard />;
}
