import React, { useRef, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ImagePreview = {
    id: string;
    name: string;
    url: string;
    file?: File;
};

interface ImageUploadPreviewProps {
    value?: ImagePreview[];
    modelValue?: ImagePreview[];
    onChange?: (value: ImagePreview[]) => void;
    onUpdateModelValue?: (value: ImagePreview[]) => void;
    max?: number;
    maxSizeMb?: number;
}

export default function ImageUploadPreview({
    value,
    modelValue,
    onChange,
    onUpdateModelValue,
    max = 5,
    maxSizeMb = 10,
}: ImageUploadPreviewProps) {
    const list = value ?? modelValue ?? [];
    const inputRef = useRef<HTMLInputElement>(null);

    const updateList = (newList: ImagePreview[]) => {
        onChange?.(newList);
        onUpdateModelValue?.(newList);
    };

    function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        const remainingSlots = Math.max(0, max - list.length);
        const maxBytes = maxSizeMb * 1024 * 1024;

        const validFiles = files
            .filter((file) => file.size <= maxBytes)
            .slice(0, remainingSlots);

        const added: ImagePreview[] = validFiles.map((file, index) => ({
            id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file),
            file,
        }));

        updateList([...list, ...added]);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

    function remove(id: string) {
        const target = list.find((preview) => preview.id === id);
        if (target?.url.startsWith('blob:')) {
            URL.revokeObjectURL(target.url);
        }
        updateList(list.filter((preview) => preview.id !== id));
    }

    useEffect(() => {
        return () => {
            list.forEach((preview) => {
                if (preview.url.startsWith('blob:')) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {list.map((preview) => (
                    <div
                        key={preview.id}
                        className="group relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
                    >
                        <img
                            src={preview.url}
                            alt={preview.name}
                            className="size-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => remove(preview.id)}
                            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={`Remove ${preview.name}`}
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ))}

                {list.length < max && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                        <ImagePlus className="size-5" />
                        <span>Add photo</span>
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onSelect}
            />

            <p className="text-xs text-muted-foreground">
                Up to {max} photos ({maxSizeMb}MB each). PNG, JPG, or WebP.
            </p>
        </div>
    );
}
