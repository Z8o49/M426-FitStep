import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from './theme';

export type IconName = 'home' | 'steps' | 'settings' | 'arrow' | 'flag' | 'calendar' | 'check' | 'refresh';

type Props = { name: IconName; size?: number; color?: string };

export function Icon({ name, size = 28, color = colors.text }: Props) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {name === 'home' && <><Path d="M2.5 10.5 12 2l9.5 8.5" {...common} /><Path d="M5 9.3V22h5v-7h4v7h5V9.3" {...common} /></>}
      {name === 'steps' && <><Ellipse cx="6.6" cy="9" rx="3" ry="5.4" rotation="-14" origin="6.6,9" {...common} /><Path d="m4.7 16 3.7-.8c2.8 5.8-3.3 7.4-3.7.8Z" {...common} /><Ellipse cx="17.4" cy="6.5" rx="3" ry="5.2" rotation="13" origin="17.4,6.5" {...common} /><Path d="m15.2 13.1 3.8.8c-.2 6.2-6.4 4.5-3.8-.8Z" {...common} /></>}
      {name === 'settings' && <><Path d="m9.2 2-.6 2.6-2 .9-2.4-.8-2.1 3.6L4 10.2v2.4l-1.9 1.9 2.1 3.6 2.5-.7 2 .9.5 2.7h4.2l.7-2.7 2-.9 2.4.7 2.1-3.6-1.9-1.9v-2.4l1.9-1.9-2.1-3.6-2.4.8-2-.9-.7-2.6Z" {...common} /><Circle cx="11.3" cy="11.5" r="3.3" {...common} /></>}
      {name === 'arrow' && <Path d="M4 12h16m-6-6 6 6-6 6" {...common} />}
      {name === 'flag' && <Path d="M4 22V3c5-4 10 4 16 0v12c-6 4-11-4-16 0" {...common} />}
      {name === 'calendar' && <><Path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 20 22H4a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 4 5ZM3 10h18M7 2v5M17 2v5" {...common} /><Circle cx="7" cy="14" r="1" fill={color} /><Circle cx="12" cy="14" r="1" fill={color} /><Circle cx="17" cy="14" r="1" fill={color} /><Circle cx="7" cy="18" r="1" fill={color} /><Circle cx="12" cy="18" r="1" fill={color} /></>}
      {name === 'check' && <Path d="m5 12 4.5 4.5L19 7" {...common} />}
      {name === 'refresh' && <><Path d="M20 8a8 8 0 1 0 .2 7M20 3v5h-5" {...common} /></>}
    </Svg>
  );
}
