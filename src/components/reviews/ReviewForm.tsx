'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ApiError } from '@/services/api/client';
import { submitReview, type ReviewFormContext } from '@/services/api/reviews';
import StarInput from './StarInput';

interface ReviewFormProps {
  token: string;
  context: ReviewFormContext;
}

type Errors = Partial<Record<'rating' | 'title' | 'body' | 'consent' | 'form', string>>;
type Outcome = 'idle' | 'submitting' | 'done' | 'used' | 'expired';

export default function ReviewForm({ token, context }: ReviewFormProps) {
  const t = useTranslations('reviews.form');
  const locale = useLocale();
  const { title_max: titleMax, body_min: bodyMin, body_max: bodyMax } = context.limits;
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome>('idle');
  const resultRef = useRef<HTMLDivElement>(null);

  // The form is replaced by a much shorter message: bring it into view and announce it.
  useEffect(() => {
    if (outcome === 'done' || outcome === 'used' || outcome === 'expired') {
      resultRef.current?.focus();
      resultRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [outcome]);

  function validate(): Errors {
    const next: Errors = {};
    if (rating < 1) next.rating = t('errors.rating');
    if (title.trim().length > titleMax) next.title = t('errors.titleTooLong', { max: titleMax });
    const len = body.trim().length;
    if (len < bodyMin) next.body = t('errors.bodyTooShort', { min: bodyMin });
    if (len > bodyMax) next.body = t('errors.bodyTooLong', { max: bodyMax });
    if (!consent) next.consent = t('errors.consent');
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setOutcome('submitting');
    try {
      await submitReview(token, { rating, title: title.trim(), body: body.trim(), consent, locale });
      setOutcome('done');
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setOutcome(err.message.includes('expired') ? 'expired' : 'used');
        return;
      }
      setOutcome('idle');
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        const server: Errors = {};
        if (err.errors.rating) server.rating = t('errors.rating');
        if (err.errors.title) server.title = t('errors.titleTooLong', { max: titleMax });
        if (err.errors.body) server.body = t('errors.bodyTooShort', { min: bodyMin });
        if (err.errors.consent) server.consent = t('errors.consent');
        setErrors(Object.keys(server).length ? server : { form: t('errors.generic') });
      } else {
        setErrors({ form: t('errors.generic') });
      }
    }
  }

  if (outcome === 'done') {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="rounded-[--radius-md] bg-teal-pale p-6 sm:p-8 outline-none">
        <h2 className="font-heading text-2xl font-semibold text-text-dark mb-2">{t('successTitle')}</h2>
        <p className="text-text-dark leading-relaxed">{t('successBody')}</p>
      </div>
    );
  }

  if (outcome === 'used' || outcome === 'expired') {
    return (
      <div ref={resultRef} tabIndex={-1} role="alert" className="rounded-[--radius-md] bg-blush-light p-6 outline-none">
        <p className="text-text-dark">{outcome === 'used' ? t('errors.used') : t('errors.expired')}</p>
      </div>
    );
  }

  const ratingLabels = [1, 2, 3, 4, 5].map((n) => t('ratingOption', { count: n, name: t(`ratingNames.${n}`) }));

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <StarInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setErrors((prev) => ({ ...prev, rating: undefined }));
          }}
          legend={t('ratingLabel')}
          optionLabels={ratingLabels}
          invalid={Boolean(errors.rating)}
          describedBy={errors.rating ? 'review-rating-error' : undefined}
        />
        {errors.rating && (
          <p id="review-rating-error" className="text-red-700 text-sm mt-1">
            {errors.rating}
          </p>
        )}
      </div>

      <Input
        id="review-title"
        label={t('titleLabel')}
        value={title}
        maxLength={titleMax}
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        aria-invalid={Boolean(errors.title) || undefined}
        autoComplete="off"
      />

      <div>
        <Input
          id="review-body"
          type="textarea"
          label={t('bodyLabel')}
          value={body}
          maxLength={bodyMax}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setBody(e.target.value);
            setErrors((prev) => ({ ...prev, body: undefined }));
          }}
          error={errors.body}
          aria-invalid={Boolean(errors.body) || undefined}
          aria-describedby="review-body-hint"
          rows={6}
          required
        />
        <p id="review-body-hint" className="mt-1 text-[13px] text-text-mid">
          {t('bodyHint', { min: bodyMin, count: body.trim().length })}
        </p>
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            aria-invalid={Boolean(errors.consent) || undefined}
            aria-describedby={errors.consent ? 'review-consent-error' : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-teal-deep"
          />
          <span className="text-sm text-text-dark leading-relaxed">
            {t('consent', { name: context.author_display_name })}
          </span>
        </label>
        {errors.consent && (
          <p id="review-consent-error" className="text-red-700 text-sm mt-1">
            {errors.consent}
          </p>
        )}
      </div>

      {errors.form && (
        <p role="alert" className="text-red-700 text-sm">
          {errors.form}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" disabled={outcome === 'submitting'} className="w-full sm:w-auto">
          {outcome === 'submitting' ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  );
}
