'use client';

import React from 'react';
import { DelhiDemandMap3D } from './DelhiDemandMap3D';

type Props = { active: boolean; listen: (fn: (k: number, u: number) => void) => void };

export function DemandBento({ active }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <DelhiDemandMap3D />
    </div>
  );
}

export default DemandBento;
