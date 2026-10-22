import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from './theme';

export type IconName = 'home' | 'steps' | 'settings' | 'arrow';

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 28, color = colors.text }: Props) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {name === 'home' && <><Path d="M2.5 10.5 12 2l9.5 8.5" {...common} /><Path d="M5 9.3V22h5v-7h4v7h5V9.3" {...common} /></>}
      {name === 'steps' && <><Ellipse cx="6.6" cy="9" rx="3" ry="5.4" rotation="-14" origin="6.6,9" {...common} /><Path d="m4.7 16 3.7-.8c2.8 5.8-3.3 7.4-3.7.8Z" {...common} /><Ellipse cx="17.4" cy="6.5" rx="3" ry="5.2" rotation="13" origin="17.4,6.5" {...common} /><Path d="m15.2 13.1 3.8.8c-.2 6.2-6.4 4.5-3.8-.8Z" {...common} /></>}
      {name === 'settings' && <><Path d="m9.2 2-.6 2.6-2 .9-2.4-.8-2.1 3.6L4 10.2v2.4l-1.9 1.9 2.1 3.6 2.5-.7 2 .9.5 2.7h4.2l.7-2.7 2-.9 2.4.7 2.1-3.6-1.9-1.9v-2.4l1.9-1.9-2.1-3.6-2.4.8-2-.9-.7-2.6Z" {...common} /><Circle cx="11.3" cy="11.5" r="3.3" {...common} /></>}
      {name === 'arrow' && <Path d="M4 12h16m-6-6 6 6-6 6" {...common} />}
    </Svg>
  );
}
