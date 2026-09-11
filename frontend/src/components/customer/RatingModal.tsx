import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Star, Check, X } from 'lucide-react';
import { api } from '../../services/api';

interface RatingModalProps {
  bookingId: string | null;
  onRatingSubmitted: () => void;
}

const AVAILABLE_TAGS = ['Fast Arrival', 'Professional', 'Friendly', 'Affordable', 'Expert Diagnostics', 'Clean Work'];

export const RatingModal: React.FC<RatingModalProps> = ({ bookingId, onRatingSubmitted }) => {
  const [stars, setStars] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fast Arrival', 'Professional']);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  if (!bookingId) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.submitRating(bookingId, {
        stars,
        feedbackTags: selectedTags,
        reviewText
      });
      onRatingSubmitted();
    } catch (err: any) {
      console.error('Rating submission error:', err);
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!bookingId} onClose={onRatingSubmitted} title="How was your roadside assistance?">
      <div className="space-y-5 text-center relative">
        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-xl font-bold">
            {error}
          </div>
        )}

        {/* Star Rating selector */}
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-3">Rate your mechanic's service:</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star className={`w-8 h-8 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
              </button>
            ))}
          </div>
          <span className="text-xs font-extrabold text-amber-400 block mt-1">
            {stars === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5 Stars)' : stars === 4 ? '⭐⭐⭐⭐ Great Service (4 Stars)' : `${stars} Stars`}
          </span>
        </div>

        {/* Feedback tags */}
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-2">Select feedback highlights:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {AVAILABLE_TAGS.map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional review text area */}
        <div>
          <textarea
            placeholder="Write a brief review for the mechanic..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRatingSubmitted}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white font-extrabold text-xs transition-colors uppercase"
          >
            Skip for Now
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Star className="w-4 h-4 fill-white" />
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
