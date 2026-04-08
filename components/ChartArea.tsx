'use client';

import { useIndicatorStore } from '@/store/useIndicatorStore';
import TrendChart from './TrendChart';
import MapView from './MapView';
import TableView from './TableView';
import InteractiveLegend from './InteractiveLegend';

export default function ChartArea() {
  const activeView = useIndicatorStore((s) => s.activeView);

  return (
    <>
      {activeView === 'trend' && (
        <>
          <InteractiveLegend />
          <div className="w-full h-[420px]">
            <TrendChart />
          </div>
        </>
      )}

      {activeView === 'map' && (
        <div className="w-full h-[420px]">
          <MapView />
        </div>
      )}

      {activeView === 'table' && (
        <div>
          <TableView />
        </div>
      )}
    </>
  );
}
