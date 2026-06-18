import { LandingRedirect } from '@/components/LandingRedirect';
import { HomeContent } from '@/components/HomeContent';

export default function HomePage() {
  return (
    <div className="bg-white overflow-hidden">
      <LandingRedirect />
      <HomeContent />
    </div>
  );
}
