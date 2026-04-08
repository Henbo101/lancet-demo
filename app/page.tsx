import FilterBar from '@/components/FilterBar';
import ModuleHeader from '@/components/ModuleHeader';
import ChartArea from '@/components/ChartArea';
import MetadataBlock from '@/components/MetadataBlock';
import ActionBar from '@/components/ActionBar';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <FilterBar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModuleHeader />
        <ChartArea />
        <MetadataBlock />
        <ActionBar />
      </div>
    </main>
  );
}
