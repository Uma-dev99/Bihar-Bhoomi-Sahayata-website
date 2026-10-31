import { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { EnquiryError, submitEnquiry } from '../api/enquiries';
import { LANGUAGE_LABELS, LANGUAGES } from '../config/languages';
import { districts } from '../content/districts';
import { serviceTypeOptions } from '../content/services';
import { useLang } from '../hooks/useLang';
import { LIMITS, mapServerErrors, validateEnquiry } from '../utils/validation';
import LangLink from './LangLink';
import LoadingState from './LoadingState';
import '../styles/components/enquiry-form.css';

const FIELD_ORDER = [
  'name',
  'phone',
  'service_type',
  'district',
  'preferred_language',
  'message',
  'privacy_accepted',
];
const SLOW_NOTICE_MS = 6000;

function initialValues(lang, service) {
  return {
    name: '',
    phone: '',
    preferred_language: lang,
    service_type: serviceTypeOptions.includes(service) ? service : '',
    district: '',
    message: '',
    privacy_accepted: false,
    website: '', // honeypot - must stay empty
  };
}

export default function EnquiryForm({ submit = submitEnquiry }) {
  const { t } = useTranslation();
  const lang = useLang();
  const [searchParams] = useSearchParams();
  const idPrefix = useId();
  const formRef = useRef(null);
  const resultRef = useRef(null);

  const [values, setValues] = useState(() => initialValues(lang, searchParams.get('service')));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [generalError, setGeneralError] = useState(null);
  const [slow, setSlow] = useState(false);

  // Follow the page language unless the visitor already picked one.
  useEffect(() => {
    setValues((v) => (v.name || v.message ? v : { ...v, preferred_language: lang }));
  }, [lang]);

  useEffect(() => {
    if (status !== 'submitting') return undefined;
    const timer = setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [status]);

  useEffect(() => {
    if (status === 'success' || (status === 'error' && generalError)) resultRef.current?.focus();
  }, [status, generalError]);

  const id = (name) => `${idPrefix}-${name}`;

  const update = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((name) => found[name]);
    if (first) formRef.current?.querySelector(`[name="${first}"]`)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;
    setGeneralError(null);

    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus('error');
      focusFirstError(found);
      return;
    }

    setStatus('submitting');
    try {
      await submit({ ...values, name: values.name.trim(), message: values.message.trim() });
      setStatus('success');
      setValues(initialValues(lang));
      setErrors({});
    } catch (error) {
      setStatus('error');
      const kind = error instanceof EnquiryError ? error.kind : 'server';
      if (kind === 'validation') {
        const mapped = mapServerErrors(error.fields);
        const known = Object.fromEntries(
          Object.entries(mapped).filter(([k]) => FIELD_ORDER.includes(k)),
        );
        setErrors(known);
        if (Object.keys(known).length) focusFirstError(known);
        else setGeneralError('server');
      } else {
        setGeneralError(
          { rate_limited: 'rateLimited', network: 'network', timeout: 'timeout' }[kind] ?? 'server',
        );
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="form-result form-result--success" role="status" tabIndex={-1} ref={resultRef}>
        <h3>{t('form.successTitle')}</h3>
        <p>{t('form.successText')}</p>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setStatus('idle')}
        >
          {t('form.sendAnother')}
        </button>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const errorCount = Object.keys(errors).length;

  const describedBy = (name, hint) =>
    [hint && id(`${name}-hint`), errors[name] && id(`${name}-error`)].filter(Boolean).join(' ') ||
    undefined;

  const fieldError = (name) =>
    errors[name] ? (
      <p className="field__error" id={id(`${name}-error`)}>
        {t(`form.errors.${errors[name]}`)}
      </p>
    ) : null;

  const common = (name, hint = false) => ({
    id: id(name),
    name,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': describedBy(name, hint),
    disabled: submitting,
  });

  return (
    <form
      ref={formRef}
      className="enquiry-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
    >
      <p className="enquiry-form__required">{t('form.requiredNote')}</p>

      {errorCount > 0 && (
        <div className="form-result form-result--error" role="alert">
          {t('form.errorSummary')}
        </div>
      )}
      {generalError && (
        <div className="form-result form-result--error" role="alert" tabIndex={-1} ref={resultRef}>
          {t(`form.errors.${generalError}`)}
        </div>
      )}

      <div className="field">
        <label htmlFor={id('name')}>
          {t('form.name')} <span aria-hidden="true">*</span>
        </label>
        <input
          {...common('name')}
          type="text"
          autoComplete="name"
          maxLength={LIMITS.nameMax + 20}
          value={values.name}
          onChange={update('name')}
          required
        />
        {fieldError('name')}
      </div>

      <div className="field">
        <label htmlFor={id('phone')}>
          {t('form.phone')} <span aria-hidden="true">*</span>
        </label>
        <p className="field__hint" id={id('phone-hint')}>
          {t('form.phoneHint')}
        </p>
        <input
          {...common('phone', true)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={25}
          value={values.phone}
          onChange={update('phone')}
          required
        />
        {fieldError('phone')}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={id('service_type')}>
            {t('form.serviceType')} <span aria-hidden="true">*</span>
          </label>
          <select
            {...common('service_type')}
            value={values.service_type}
            onChange={update('service_type')}
            required
          >
            <option value="">{t('form.servicePlaceholder')}</option>
            {serviceTypeOptions.map((service) => (
              <option key={service} value={service}>
                {t(`services.items.${service}.name`)}
              </option>
            ))}
          </select>
          {fieldError('service_type')}
        </div>

        <div className="field">
          <label htmlFor={id('district')}>{t('form.district')}</label>
          <select {...common('district')} value={values.district} onChange={update('district')}>
            <option value="">{t('form.districtPlaceholder')}</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district[lang]}
              </option>
            ))}
            <option value="not_sure">{t('form.districtNotSure')}</option>
          </select>
          {fieldError('district')}
        </div>
      </div>

      <fieldset className="field field--radios" disabled={submitting}>
        <legend>
          {t('form.preferredLanguage')} <span aria-hidden="true">*</span>
        </legend>
        {LANGUAGES.map((code) => (
          <label key={code} className="radio" lang={code}>
            <input
              type="radio"
              name="preferred_language"
              value={code}
              checked={values.preferred_language === code}
              onChange={update('preferred_language')}
            />
            {LANGUAGE_LABELS[code]}
          </label>
        ))}
        {fieldError('preferred_language')}
      </fieldset>

      <div className="field">
        <label htmlFor={id('message')}>
          {t('form.message')} <span aria-hidden="true">*</span>
        </label>
        <p className="field__hint" id={id('message-hint')}>
          {t('form.messageHint')}
        </p>
        <textarea
          {...common('message', true)}
          rows={6}
          maxLength={LIMITS.messageMax}
          value={values.message}
          onChange={update('message')}
          required
        />
        <p className="field__counter" aria-live="polite">
          {t('form.characters', { count: values.message.length, max: LIMITS.messageMax })}
        </p>
        {fieldError('message')}
      </div>

      {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={id('website')}>{t('form.honeypot')}</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update('website')}
        />
      </div>

      <div className="field field--checkbox">
        <input
          {...common('privacy_accepted')}
          type="checkbox"
          checked={values.privacy_accepted}
          onChange={update('privacy_accepted')}
          required
        />
        <label htmlFor={id('privacy_accepted')}>
          {t('form.privacyConsent')} <span aria-hidden="true">*</span>
        </label>
        <p className="field__hint">
          <LangLink page="privacy">{t('form.privacyLink')}</LangLink>
        </p>
        {fieldError('privacy_accepted')}
      </div>

      <div className="enquiry-form__actions">
        <button
          type="submit"
          className="button button--primary button--large"
          disabled={submitting}
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </button>
        {submitting && <LoadingState label={slow ? t('form.slowServer') : t('form.submitting')} />}
      </div>
    </form>
  );
}
