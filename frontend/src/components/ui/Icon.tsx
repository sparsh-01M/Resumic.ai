import { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface IconProps extends React.ComponentPropsWithoutRef<'svg'> {
  icon: LucideIcon;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(({ icon: IconComponent, ...props }, ref) => {
  return <IconComponent ref={ref} {...props} />;
});

Icon.displayName = 'Icon';

export default Icon; 