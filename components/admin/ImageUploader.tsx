'use client';
import { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  // Convert file to base64 and compress if needed
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Only image files allowed'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image too large (max 5MB)'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        // Compress via canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
            else { w = Math.round((w * MAX) / h); h = MAX; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const errors: string[] = [];
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const dataUrl = await processFile(file);
        newImages.push(dataUrl);
      } catch (e: unknown) {
        errors.push(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
    if (errors.length > 0) alert(errors.join('\n'));
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (url) { onChange([...images, url]); setUrlInput(''); }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[{ key: 'upload', label: '📁 Upload File', icon: <Upload size={12} /> }, { key: 'url', label: '🔗 Paste URL', icon: <LinkIcon size={12} /> }].map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key as 'upload' | 'url')} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === key ? 'var(--accent-cyan)' : 'transparent',
            color: tab === key ? '#000' : 'var(--text-secondary)',
            transition: 'all 0.15s', fontFamily: 'var(--font-main)',
          }}>{label}</button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-cyan)' : 'var(--border-bright)'}`,
              borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(0,212,255,0.04)' : 'var(--bg-elevated)',
              transition: 'all 0.2s ease', marginBottom: 12,
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 14 }}>Processing images...</span>
              </div>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--accent-cyan)' }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, WebP — max 5MB per image</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Images are stored directly in the browser (no cloud needed)</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            className="input-field"
            style={{ padding: '10px 14px', fontSize: 14, flex: 1 }}
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/product-image.jpg"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
          />
          <button type="button" onClick={addUrl} className="btn-secondary" style={{ padding: '10px 18px', fontSize: 13, flexShrink: 0 }}>
            Add URL
          </button>
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === 0 ? 'var(--accent-cyan)' : 'var(--border)'}`, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Product image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,212,255,0.9)', color: '#000', fontSize: 8, fontWeight: 700, textAlign: 'center', padding: '2px 0', letterSpacing: '0.5px' }}>MAIN</div>
              )}
              <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <ImageIcon size={12} /> No images added yet — the first image will be used as the main product image
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
