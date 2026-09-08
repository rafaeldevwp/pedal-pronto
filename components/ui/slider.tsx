import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const resolvedValue = value ?? defaultValue ?? min;
  const thumbCount = Array.isArray(resolvedValue) ? Math.max(1, resolvedValue.length) : 1;

  return (
    <SliderPrimitive.Root
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="data-vertical:min-h-40 relative flex h-11 w-full touch-none items-center px-2 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-muted rounded-full data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2 relative grow overflow-hidden select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-primary ring-ring/40 relative block size-5 shrink-0 select-none rounded-full border-2 bg-white shadow-sm transition-[color,box-shadow,transform] after:absolute after:-inset-3 hover:ring-3 focus-visible:ring-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-110 active:ring-3 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
