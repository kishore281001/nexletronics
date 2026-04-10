'use client';
import { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader, CheckCircle } from 'lucide-react';
import { uploadProductImage, deleteProductImage } from '@/lib/store';
import { useToast } from '@/lib/toast-context';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

// Compress image client-side before uploading to save storage
function compressImage(file: File, maxPx = 900, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxPx || h > maxPx) {
        if (w > h) { h = Math.round((h * maxPx) / w); w = maxPx; }
        else { w = Math.round((w * maxPx) / h); h = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(new File([blob], file.name, { type: 'image/webp' }));
          else resolve(file);
        },
        'image/webp', quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const errors: string[] = [];
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

      if (!file.type.startsWith('image/')) { errors.push(`${file.name}: Not an image`); continue; }
      if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name}: Too large (max 10MB)`); continue; }

      try {
        // Compress locally first (saves Supabase Storage quota)
        const compressed = await compressImage(file);
        const url = await uploadProductImage(compressed);
        if (url) newUrls.push(url);
        else errors.push(`${file.name}: Upload failed`);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : 'Error'}`);
      }
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
    setUploadProgress('');
    if (errors.length > 0) showToast('error', 'Upload issues', errors.join(', '));
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (url) { onChange([...images, url]); setUrlInput(''); }
  };

  const remove = async (idx: number) => {
    const url = images[idx];
    // Delete from Supabase Storage if it's a Supabase URL
    if (url.includes('supabase.co/storage')) {
      await deleteProductImage(url);
    }
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, width: 'fit-content', border: '1px solid var(--border)' }}>
        {[{ key: 'upload', label: '📁 Upload File' }, { key: 'url', label: '🔗 Paste URL' }].map(({ key, label }) => (
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
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent-cyan)' : 'var(--border-bright)'}`,
              borderRadius: 12, padding: '32px 24px', textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: dragOver ? 'rgba(0,212,255,0.04)' : 'var(--bg-elevated)',
              transition: 'all 0.2s ease', marginBottom: 12,
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{uploadProgress}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uploading to Supabase Storage...</span>
              </div>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--accent-cyan)' }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Click to upload or drag & drop
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, WebP — auto-compressed before upload</div>
                <div style={{ fontSize: 11, color: 'var(--accent-cyan)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  <CheckCircle size={10} /> Stored on Supabase CDN — loads fast everywhere
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="input-field"
            style={{ padding: '10px 14px', fontSize: 16, flex: 1, minWidth: 0 }}
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
              <img src={src} alt={`Product ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,212,255,0.9)', color: '#000', fontSize: 8, fontWeight: 700, textAlign: 'center', padding: '2px 0' }}>MAIN</div>
              )}
              <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <ImageIcon size={12} /> No images yet — first image is used as the main product thumbnail
        </div>
      )}

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
