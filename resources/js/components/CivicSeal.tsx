import React from 'react';
import { cn } from '@/lib/utils';

interface CivicSealProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-14',
    xl: 'size-20',
};

export default function CivicSeal({
    size = 'md',
    className,
    ...props
}: CivicSealProps) {
    return (
        <img
            src="/images/loon-seal.png"
            alt="Municipality of Loon Official Seal"
            className={cn(
                sizeClasses[size],
                'rounded-full object-contain select-none',
                className
            )}
            {...props}
        />
    );
}
