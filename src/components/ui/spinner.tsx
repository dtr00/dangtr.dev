import * as React from 'react'

import { LoadingGrid } from '#/components/ui/loading-grid'
import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-full',
        className,
      )}
      {...props}
    >
      <LoadingGrid />
    </div>
  )
}

export { Spinner }
