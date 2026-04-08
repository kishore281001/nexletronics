'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getReviews, addReview, getUserReview, isVerifiedPurchase, getRatingSummary, RatingSummary } from '@/lib/store';
import { Review } from '@/lib/types';
import { Star, ThumbsUp, ShieldCheck, LogIn, Edit3, Send } from 'lucide-react';
import Link from 'next/link';

// ─── Star renderer ─────────────────────────────────────────────────────────
function Stars({ rating, size = 14, interactive = false, onSelect }: {
  rating: number; size?: number; interactive?: boolean; onSelect?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => {
        const filled = interactive ? (hovered || rating) >= s : rating >= s;
        const half   = !interactive && !filled && rating >= s - 0.5;
        return (
          <span key={s}
            onClick={() => interactive && onSelect?.(s)}
            onMouseEnter={() => interactive && setHovered(s)}
            onMouseLeave={() => interactive && setHovered(0)}
            style={{ cursor: interactive ? 'pointer' : 'default', display: 'flex' }}
          >
            <Star
              size={size}
              fill={filled || half ? (filled ? '#FFB800' : '#7A5800') : 'transparent'}
              color={filled || half ? '#FFB800' : 'var(--text-muted)'}
              style={{ transition: 'all 0.1s' }}
            />
          </span>
        );
      })}
    </div>
  );
}

// ─── Rating breakdown bar ───────────────────────────────────────────────────
function BreakdownBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--accent-cyan)', width: 24, flexShrink: 0, textAlign: 'right' }}>{label}★</span>
      <div style={{ flex: 1, height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#FFB800', borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>{count}</span>
    </div>
  );
}

// ─── Single review card ─────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const initials = review.user_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent-cyan), #7B2FFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#000',
        }}>{initials}</div>

        <div style={{ flex: 1 }}>
          {/* Name + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{review.user_name}</span>
            {review.verified_purchase && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                <ShieldCheck size={11} /> Verified Purchase
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{date}</span>
          </div>

          {/* Stars */}
          <div style={{ marginBottom: 8 }}>
            <Stars rating={review.rating} size={13} />
          </div>

          {/* Body */}
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{review.body}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Write review form ──────────────────────────────────────────────────────
function WriteReviewForm({ productId, userId, userName, isVerified, onSubmit }: {
  productId: string; userId: string; userName: string; isVerified: boolean; onSubmit: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [body, setBody]     = useState('');
  const [error, setError]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!rating)                     { setError('Please select a star rating.'); return; }
    if (body.trim().length < 10)     { setError('Review must be at least 10 characters.'); return; }

    addReview({
      product_id: productId, user_id: userId, user_name: userName,
      rating: rating as 1|2|3|4|5, body: body.trim(),
      verified_purchase: isVerified,
    });
    setSubmitted(true);
    setTimeout(() => onSubmit(), 600);
  };

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--success)', fontSize: 14 }}>
      ✅ Thank you! Your review has been posted.
    </div>
  );

  return (
    <div style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 14, padding: 24, marginTop: 8 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Edit3 size={16} color="var(--accent-cyan)" /> Write a Review
      </h3>

      {/* Star selector */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Your Rating *</label>
        <Stars rating={rating} size={28} interactive onSelect={setRating} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Click to rate'}
        </div>
      </div>

      {/* Body */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
          Your Review *
          <span style={{ float: 'right', fontWeight: 400, color: 'var(--text-muted)' }}>{body.length}/500</span>
        </label>
        <textarea
          className="input-field"
          style={{ padding: '10px 14px', fontSize: 14, resize: 'vertical', minHeight: 110, fontFamily: 'var(--font-main)' }}
          placeholder="Tell others about your experience — quality, packaging, delivery speed..."
          value={body}
          onChange={e => { setBody(e.target.value.slice(0, 500)); setError(''); }}
        />
      </div>

      {error && (
        <div style={{ fontSize: 13, color: 'var(--error)', padding: '8px 12px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 7, marginBottom: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {isVerified && (
        <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <ShieldCheck size={13} /> Your review will show a Verified Purchase badge
        </div>
      )}

      <button onClick={submit} className="btn-primary" style={{ padding: '11px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Send size={14} /> Post Review
      </button>
    </div>
  );
}

// ─── Main ProductReviews component ───────────────────────────────────────────
export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews]         = useState<Review[]>([]);
  const [summary, setSummary]         = useState<RatingSummary>({ avg: 0, total: 0, counts: { 1:0, 2:0, 3:0, 4:0, 5:0 } });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isVerified, setIsVerified]   = useState(false);
  const [showForm, setShowForm]       = useState(false);

  const load = () => {
    setReviews(getReviews(productId));
    setSummary(getRatingSummary(productId));
    if (user) {
      setHasReviewed(!!getUserReview(productId, user.id));
      setIsVerified(isVerifiedPurchase(productId, user.id));
    }
  };

  useEffect(() => { load(); }, [productId, user]);

  const onReviewSubmit = () => { load(); setShowForm(false); };

  return (
    <div style={{ marginTop: 60 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Star size={20} fill="#FFB800" color="#FFB800" />
        Customer Reviews
        {summary.total > 0 && (
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}>({summary.total} review{summary.total !== 1 ? 's' : ''})</span>
        )}
      </h2>

      {/* Rating summary card */}
      {summary.total > 0 && (
        <div className="glass" style={{ borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 32, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{summary.avg}</div>
            <Stars rating={summary.avg} size={18} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>out of 5</div>
          </div>
          <div>
            {([5, 4, 3, 2, 1] as const).map(s => (
              <BreakdownBar key={s} label={String(s)} count={summary.counts[s]} total={summary.total} />
            ))}
          </div>
        </div>
      )}

      {/* Write a review CTA */}
      <div style={{ marginBottom: 32 }}>
        {!user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(123,47,255,0.05)', border: '1px solid rgba(123,47,255,0.15)', borderRadius: 12 }}>
            <LogIn size={18} color="#A855F7" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Sign in to write a review</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Share your experience with other buyers</div>
            </div>
            <Link href="/login" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>Sign In</Link>
          </div>
        ) : hasReviewed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 10, fontSize: 14, color: 'var(--success)' }}>
            <ThumbsUp size={15} /> You've reviewed this product — thank you!
          </div>
        ) : (
          <div>
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="btn-secondary" style={{ padding: '11px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={15} /> Write a Review
              </button>
            ) : (
              <WriteReviewForm productId={productId} userId={user.id} userName={user.name} isVerified={isVerified} onSubmit={onReviewSubmit} />
            )}
          </div>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <Star size={32} color="var(--text-muted)" style={{ display: 'block', margin: '0 auto 12px' }} />
          No reviews yet — be the first to review this product!
        </div>
      ) : (
        <div>{reviews.map(r => <ReviewCard key={r.id} review={r} />)}</div>
      )}
    </div>
  );
}
