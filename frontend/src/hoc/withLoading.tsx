import React from 'react';
import type { DataTableProps } from '@/components/app/data-table';
import { Progress } from '@/components/ui/progress';

interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<TData, TValue, P extends {}>(
  WrappedComponent: React.ComponentType<DataTableProps<TData, TValue> & P>
): React.FC<DataTableProps<TData, TValue> & P & WithLoadingProps> {
  return function WithLoadingComponent({ isLoading, ...props }: DataTableProps<TData, TValue> & P & WithLoadingProps) {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isLoading) {
        interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + 25;
            return newProgress > 100 ? 100 : newProgress;
          });
        }, 100);
      } else {
        setProgress(0);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Progress value={progress} className="w-1/3" />
        </div>
      );
    }
    
    return <WrappedComponent {...(props as DataTableProps<TData, TValue> & P)} />;
  };
}

export default withLoading;
