"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface SimpleRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    height?: string;
}

export function SimpleRichTextEditor({
    value,
    onChange,
    placeholder,
    disabled,
    height = '300px'
}: SimpleRichTextEditorProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Keep the compact toolbar while allowing inline links.
    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline', 'link'],
        ],
        clipboard: {
            matchVisual: false,
        },
    }), []);

    // Only allow basic inline formatting - no headings, lists, etc.
    const formats = [
        'bold', 'italic', 'underline', 'link'
    ];

    if (!mounted) {
        return <div className="h-40 rounded-md border bg-muted/20 animate-pulse" />;
    }

    return (
        <div className="simple-rich-text-editor-container relative mb-16" style={{ height }}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={disabled}
                className="bg-card rounded-md"
                style={{ height }}
            />
        </div>
    );
}
