import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { uploadImageToImageBB } from '../lib/imgbb';

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  colors: string[];
  stock: number;
  imageUrl?: string;
  imageThumbUrl?: string;
}

const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Black', 'White', 'Gray'];

const COLOR_HEX: Record<string, string> = {
  Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#f59e0b', Purple: '#a855f7',
  Pink: '#ec4899', Orange: '#f97316', Black: '#111111', White: '#f5f5f5', Gray: '#6b7280',
};

interface Props {
  initial?: Partial<ProductFormData>;
  categories: string[];
  onSubmit: (data: ProductFormData) => void;
  submitting?: boolean;
}

const fieldClass =
  'w-full px-4 py-3 bg-purple-500/[0.06] border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:border-transparent transition-all text-purple-50 placeholder:text-purple-300/30 font-tech';
const labelClass = 'block font-tech text-[10px] tracking-[0.3em] uppercase text-purple-300/70 mb-2';

export default function ProductForm({ initial, categories, onSubmit, submitting }: Props) {
  const [data, setData] = useState<ProductFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? 0,
    category: initial?.category ?? categories[0] ?? '',
    colors: initial?.colors ?? [],
    stock: initial?.stock ?? 0,
    imageUrl: initial?.imageUrl ?? '',
    imageThumbUrl: initial?.imageThumbUrl ?? '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data.category && categories[0]) {
      setData((current) => ({ ...current, category: categories[0] }));
    }
  }, [categories, data.category]);

  const update = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleColor = (c: string) =>
    setData((d) => ({ ...d, colors: d.colors.includes(c) ? d.colors.filter((x) => x !== c) : [...d.colors, c] }));

  const uploadImage = async (file?: File) => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadError('');
      const uploaded = await uploadImageToImageBB(file, data.name || file.name);
      setData((current) => ({
        ...current,
        imageUrl: uploaded.url,
        imageThumbUrl: uploaded.thumbnailUrl,
      }));
    } catch (error: any) {
      setUploadError(error.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categories.includes(data.category) || uploading) return;
    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>// Product Name</label>
          <input className={fieldClass} value={data.name} onChange={(e) => update('name', e.target.value)} placeholder="Product name" required />
        </div>
        <div>
          <label className={labelClass}>// Category</label>
          <select className={fieldClass} value={data.category} onChange={(e) => update('category', e.target.value)} disabled={categories.length === 0} required>
            {categories.length === 0 && <option value="">Create a category first</option>}
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>// Product Visual · ImageBB v1</label>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
        {data.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-purple-500/25 bg-[#07060f] aspect-[16/7]">
            <img src={data.imageUrl} alt="Product upload preview" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-3 bg-gradient-to-t from-black/85 to-transparent">
              <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-100">ImageBB connected</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="px-3 py-1.5 rounded-lg border border-white/20 bg-black/40 text-white hover:bg-black/60 font-tech text-[10px] tracking-[0.18em] uppercase">Replace</button>
                <button type="button" onClick={() => setData((current) => ({ ...current, imageUrl: '', imageThumbUrl: '' }))} className="p-1.5 rounded-lg border border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25" aria-label="Remove image"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full min-h-32 rounded-xl border border-dashed border-purple-400/35 bg-purple-500/[0.04] hover:bg-purple-500/[0.08] hover:border-purple-300/60 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-60">
            {uploading ? <Loader2 className="h-6 w-6 text-purple-300 animate-spin" /> : <ImagePlus className="h-6 w-6 text-purple-300" />}
            <span className="font-tech text-sm text-purple-100">{uploading ? 'Uploading to ImageBB…' : 'Upload product image'}</span>
            <span className="font-tech text-[10px] tracking-[0.2em] uppercase text-purple-300/55">PNG · JPG · WEBP · GIF · max 32 MB</span>
          </button>
        )}
        {uploadError && <p className="mt-2 font-tech text-xs text-red-300">{uploadError}</p>}
        {!data.imageUrl && !uploading && <p className="mt-2 flex items-center gap-1.5 font-tech text-[10px] text-purple-300/50"><UploadCloud className="h-3.5 w-3.5" /> Optional — the Eclipse cover is used when empty.</p>}
      </div>

      <div>
        <label className={labelClass}>// Description</label>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={3}
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe the product and what is included"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>// Price (USD)</label>
          <input type="number" min={0} step="0.01" className={fieldClass} value={data.price} onChange={(e) => update('price', parseFloat(e.target.value) || 0)} required />
        </div>
        <div>
          <label className={labelClass}>// Stock</label>
          <input type="number" min={0} className={fieldClass} value={data.stock} onChange={(e) => update('stock', parseInt(e.target.value, 10) || 0)} required />
        </div>
      </div>

      <div>
        <label className={labelClass}>// Colorways</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const on = data.colors.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleColor(c)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-tech text-xs tracking-wide transition-all border ${
                  on ? 'border-purple-400/60 text-white' : 'border-purple-500/15 text-purple-200/70 hover:border-purple-400/40'
                }`}
                style={on ? { background: 'rgba(124,58,237,0.18)' } : undefined}
              >
                <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: COLOR_HEX[c] }} />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading || categories.length === 0}
        className="w-full py-3.5 rounded-xl font-display font-bold tracking-[0.2em] text-sm text-white disabled:opacity-60"
        style={{
          background: 'linear-gradient(90deg,#6d28d9,#a855f7,#6d28d9)',
          boxShadow: '0 10px 30px -10px rgba(124,58,237,0.8), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      >
        {submitting ? 'COMMITTING…' : uploading ? 'WAIT FOR IMAGE UPLOAD' : categories.length === 0 ? 'CREATE A CATEGORY FIRST' : 'COMMIT TO ARRAY'}
      </button>
    </form>
  );
}
