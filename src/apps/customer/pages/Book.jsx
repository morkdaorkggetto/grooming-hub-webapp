import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { useUnsavedChanges } from '../../../shared/navigation/UnsavedChangesProvider';
import { useTenant } from '../../../shared/tenant/TenantProvider';
import { getTenantWhatsAppPhone } from '../../../shared/tenant/contact';
import {
  getBookingSchedule,
  getDateClosure,
  isTimePreferenceClosed,
} from '../../../shared/tenant/bookingSchedule';
import BackgroundDecor from '../../../shared/ui/BackgroundDecor';
import Card from '../../../shared/ui/Card';
import DesiredDateStrip from '../../../shared/ui/DesiredDateStrip';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import StatusBadge from '../../../shared/ui/StatusBadge';
import WarmNotice from '../../../shared/ui/WarmNotice';
import {
  getCustomerAppointmentRequestWhatsAppUrl,
  getPublicGroomingHubWhatsAppUrl,
} from '../../staff/lib/whatsapp';
import { usePets } from '../hooks/usePets';
import { useAppointmentRequests } from '../hooks/useAppointmentRequests';
import { getBookingServices, submitAppointmentRequest } from '../lib/booking';
import { getBookingFullPeriod } from '../lib/bookingDates';
import './Book.css';

const UNSAVED_MESSAGE = 'Hai una richiesta non inviata. Vuoi davvero lasciare la pagina?';

const TIME_PREFERENCES = [
  { value: 'morning', label: 'Mattina (9–13)' },
  { value: 'afternoon', label: 'Pomeriggio (13–19)' },
  { value: 'flexible', label: 'Per me è uguale' },
];

const COAT_CONDITIONS = [
  { value: 'some_knots', label: 'Qualche nodo' },
  { value: 'very_matted', label: 'Molto annodato' },
  { value: 'heavy_shedding', label: 'Perde tanto pelo' },
  { value: 'regular_grooming', label: 'Lo porto regolarmente' },
  { value: 'clean_long', label: 'Pulito, solo lungo' },
];

const SERVICE_ICONS = ['drop', 'scissors', 'sparkle', 'bath'];
const DATE_LABEL = new Intl.DateTimeFormat('it-IT', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDateOptions = () => Array.from({ length: 12 }, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + index + 1);
  return { date, value: toLocalDateValue(date) };
});

const formatDesiredDate = (value) => value
  ? DATE_LABEL.format(new Date(`${value}T12:00:00`))
  : 'Non scelta';

function StepHead({ number, title, hint }) {
  return (
    <div className="gh-book-step-head">
      <span className="gh-book-step-number">{number}</span>
      <div>
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </div>
    </div>
  );
}

function SelectChip({ selected, disabled = false, onClick, children }) {
  return (
    <button type="button" className="gh-book-chip" aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {children}
      {disabled ? <small>Non disponibile</small> : null}
    </button>
  );
}

function PetChoice({ pet, selected, disabled, onClick }) {
  return (
    <button type="button" className="gh-book-choice gh-book-pet-choice" aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {pet.photo_url ? (
        <img src={pet.photo_url} alt="" className="gh-book-pet-avatar" />
      ) : (
        <span className="gh-book-pet-avatar gh-book-pet-initial" aria-hidden="true">
          {(pet.name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      <span className="gh-book-choice-copy">
        <strong>{pet.name}</strong>
        <small>{disabled ? 'Richiesta già in attesa' : pet.breed || 'Razza non indicata'}</small>
      </span>
      {selected ? <Icon name="check" size={18} /> : null}
    </button>
  );
}

function ServiceChoice({ service, selected, icon, onClick }) {
  return (
    <button type="button" className="gh-book-choice gh-book-service-choice" aria-pressed={selected} onClick={onClick}>
      <span className="gh-book-service-icon" aria-hidden="true"><Icon name={icon} size={18} /></span>
      <span className="gh-book-choice-copy">
        <strong>{service.name}</strong>
      </span>
    </button>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="gh-book-summary-row">
      <span>{label}</span>
      <strong>{value || 'Da scegliere'}</strong>
    </div>
  );
}

function LoadingBook() {
  return (
    <main className="gh-book-page">
      <BackgroundDecor />
      <div className="gh-book-shell">
        <Skeleton width={190} height={12} />
        <Skeleton width="45%" height={52} style={{ marginTop: 20 }} />
        <div className="gh-book-loading-grid">
          <Skeleton height={520} style={{ borderRadius: 20 }} />
          <Skeleton height={310} style={{ borderRadius: 20 }} />
        </div>
      </div>
    </main>
  );
}

function BookingResult({ submission, salonPhone }) {
  const whatsappUrl = getCustomerAppointmentRequestWhatsAppUrl({
    salonPhone,
    petName: submission.pet.name,
    desiredDate: submission.desiredDate,
    serviceName: submission.service.name,
    timeWindowLabel: submission.timePreference?.label,
    notes: submission.coatNotes,
  });

  return (
    <main className="gh-book-page gh-book-result-page">
      <BackgroundDecor />
      <section className="gh-book-result">
        <div className="gh-book-result-icon" aria-hidden="true"><Icon name="whatsapp" size={38} /></div>
        <StatusBadge status="scheduled" approvalStatus="pending" />
        <h1>Ci pensiamo noi da qui.</h1>
        <p className="gh-book-result-copy">
          La tua richiesta è arrivata al salone. Ti scriviamo noi su WhatsApp con giorno e ora —
          di solito in pochi minuti. Se preferisci anticiparci, il numero è sempre lo stesso.
        </p>
        <Card padding={22} radius="lg" elevated={false} style={{ width: '100%', borderRadius: 20 }}>
          <SummaryRow label="Pet" value={submission.pet.name} />
          <SummaryRow label="Indicazione" value={submission.service.name} />
          <SummaryRow label="Data desiderata" value={formatDesiredDate(submission.desiredDate)} />
          <SummaryRow label="Preferenza" value={submission.timePreference?.label || 'Nessuna preferenza'} />
        </Card>
        <div className="gh-book-result-actions">
          {whatsappUrl ? (
            <a className="gh-book-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={18} /> Scrivici su WhatsApp
            </a>
          ) : null}
          <Link className="gh-book-ghost-link" to="/u/home">Torna alla home</Link>
        </div>
        <p className="gh-book-calendar-note">
          Quando il salone conferma, qui troverai anche “Aggiungi al calendario” (.ics).
        </p>
      </section>
    </main>
  );
}

export default function Book() {
  const { loading: authLoading } = useRequireCustomer();
  const { tenant, tenantId } = useTenant();
  const { data: pets, loading: petsLoading, error: petsError } = usePets();
  const { data: requests, loading: requestsLoading } = useAppointmentRequests();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [timePreference, setTimePreference] = useState('');
  const [coatConditions, setCoatConditions] = useState([]);
  const [coatNotes, setCoatNotes] = useState('');
  const [declaredAge, setDeclaredAge] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submission, setSubmission] = useState(null);

  const bookingSchedule = useMemo(
    () => getBookingSchedule(tenant?.settings),
    [tenant?.settings]
  );
  const dateOptions = useMemo(() => createDateOptions().map((item) => {
    const closure = getDateClosure(item.date, bookingSchedule);
    return {
      ...item,
      disabled: closure.isClosed,
      unavailableLabel: closure.label,
    };
  }), [bookingSchedule]);
  const requestedPetId = searchParams.get('petId') || '';
  const selectedPet = pets.find((pet) => pet.id === petId) || null;
  const pendingPetIds = useMemo(
    () => new Set(requests.filter((request) => request.status === 'pending').map((request) => request.pet_id)),
    [requests]
  );
  const selectedPetHasPendingRequest = pendingPetIds.has(petId);
  const selectedService = services.find((service) => service.id === serviceId) || null;
  const selectedTimePreference = TIME_PREFERENCES.find((item) => item.value === timePreference) || null;
  const selectedCoatLabels = COAT_CONDITIONS.filter((item) => coatConditions.includes(item.value)).map((item) => item.label);
  const needsDeclaredAge = Boolean(selectedPet && !selectedPet.birth_date);

  useEffect(() => {
    if (!tenantId) return undefined;
    let active = true;
    setServicesLoading(true);
    setServicesError(null);
    getBookingServices(tenantId)
      .then((rows) => { if (active) setServices(rows); })
      .catch((error) => {
        if (active) {
          setServices([]);
          setServicesError(error);
        }
      })
      .finally(() => { if (active) setServicesLoading(false); });
    return () => { active = false; };
  }, [tenantId]);

  useEffect(() => {
    if (petId || petsLoading) return;
    if (requestedPetId && pets.some((pet) => pet.id === requestedPetId)) setPetId(requestedPetId);
  }, [petId, pets, petsLoading, requestedPetId]);

  useEffect(() => {
    if (selectedPet?.birth_date) setDeclaredAge('');
  }, [selectedPet?.birth_date]);

  const hasCoatCondition = coatConditions.length > 0 || Boolean(coatNotes.trim());
  const selectedDateClosure = getDateClosure(desiredDate, bookingSchedule);
  const canSubmit = Boolean(
    petId
    && serviceId
    && !selectedPetHasPendingRequest
    && desiredDate
    && !selectedDateClosure.isClosed
    && !isTimePreferenceClosed(timePreference, selectedDateClosure)
    && hasCoatCondition
    && (!needsDeclaredAge || declaredAge.trim())
  );
  const isDirty = !submission && Boolean(
    (petId && petId !== requestedPetId)
    || serviceId
    || desiredDate
    || timePreference
    || coatConditions.length
    || coatNotes
    || declaredAge
  );
  useUnsavedChanges(isDirty, UNSAVED_MESSAGE);

  const selectedDate = desiredDate ? new Date(`${desiredDate}T12:00:00`) : null;
  const daysAhead = selectedDate
    ? Math.floor((selectedDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;
  const fullPeriod = getBookingFullPeriod(desiredDate);

  const toggleCoatCondition = (value) => {
    setCoatConditions((current) => current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]);
  };

  const handleDateChange = (value) => {
    const closure = getDateClosure(value, bookingSchedule);
    setDesiredDate(value);
    setTimePreference((current) => isTimePreferenceClosed(current, closure) ? '' : current);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitAppointmentRequest({
        tenantId, petId, serviceId, desiredDate, timePreference,
        coatConditionCodes: coatConditions,
        coatConditionNotes: coatNotes,
        declaredPetAge: needsDeclaredAge ? declaredAge : '',
      });
      setSubmission({
        pet: selectedPet,
        service: selectedService,
        desiredDate,
        timePreference: selectedTimePreference,
        coatLabels: selectedCoatLabels,
        coatNotes: coatNotes.trim(),
      });
    } catch (error) {
      setSubmitError(
        error.code === '23505' || /gia una richiesta|già una richiesta/i.test(error.message || '')
          ? 'Per questo pet c’è già una richiesta in attesa.'
          : error.message || 'Invio non riuscito'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || petsLoading || servicesLoading || requestsLoading) return <LoadingBook />;
  const salonPhone = getTenantWhatsAppPhone(tenant);

  if (submission) return <BookingResult submission={submission} salonPhone={salonPhone} />;

  const whatsappFallback = getPublicGroomingHubWhatsAppUrl({
    salonPhone,
    petName: selectedPet?.name,
  });

  return (
    <main className="gh-book-page">
      <BackgroundDecor />
      <div className="gh-book-shell">
        <header className="gh-book-header">
          <Eyebrow>Richiesta di appuntamento</Eyebrow>
          <h1>Quando ce lo porti?</h1>
          <p>
            Dicci cosa serve e quando preferiresti passare. Poi ci pensiamo noi: ti confermiamo
            giorno e ora su WhatsApp.
          </p>
        </header>

        {petsError ? <div className="gh-book-error" role="alert">Non riusciamo a caricare i tuoi pet. Riprova tra un momento.</div> : null}

        {servicesError || services.length === 0 ? (
          <Card padding={28} radius="lg" style={{ maxWidth: 620, borderRadius: 20 }}>
            <h2 className="gh-book-empty-title">Qui non carica, ma noi ci siamo.</h2>
            <p className="gh-book-empty-copy">Scrivici su WhatsApp e prenotiamo a voce, come sempre.</p>
            {whatsappFallback ? (
              <a className="gh-book-whatsapp-button" href={whatsappFallback} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={18} /> Scrivici su WhatsApp
              </a>
            ) : null}
          </Card>
        ) : (
          <form className="gh-book-layout" onSubmit={handleSubmit}>
            <div className="gh-book-form-column">
              <section className="gh-book-step">
                <StepHead number="1" title="Per chi?" />
                <div className="gh-book-pet-grid">
                  {pets.map((pet) => <PetChoice key={pet.id} pet={pet} selected={pet.id === petId} disabled={pendingPetIds.has(pet.id)} onClick={() => setPetId(pet.id)} />)}
                </div>
                {selectedPetHasPendingRequest ? (
                  <WarmNotice title="Richiesta già inviata">
                    La trovi nella home. Aspetta la risposta del salone prima di inviarne un’altra per lo stesso pet.
                  </WarmNotice>
                ) : null}
                {needsDeclaredAge ? (
                  <div className="gh-book-age-block">
                    <label htmlFor="declared-pet-age">Quanti anni ha {selectedPet.name}?</label>
                    <p>Non ce l’hai ancora detto — ci serve solo la prima volta.</p>
                    <input id="declared-pet-age" value={declaredAge} maxLength={80} placeholder="Es. 3 anni" onChange={(event) => setDeclaredAge(event.target.value)} />
                  </div>
                ) : null}
              </section>

              <section className="gh-book-step">
                <StepHead number="2" title="Cosa serve?" hint="In negozio decidiamo insieme i dettagli." />
                <div className="gh-book-service-grid">
                  {services.map((service, index) => (
                    <ServiceChoice key={service.id} service={service} selected={service.id === serviceId} icon={SERVICE_ICONS[index % SERVICE_ICONS.length]} onClick={() => setServiceId(service.id)} />
                  ))}
                </div>
                <p className="gh-book-duration-note">Il cane resta con noi qualche ora. Ti scriviamo appena è pronto.</p>
              </section>

              <section className="gh-book-step">
                <StepHead number="3" title="Quando ti andrebbe bene?" />
                <DesiredDateStrip dates={dateOptions} value={desiredDate} onChange={handleDateChange} />
                <p className="gh-book-date-hint">È la data che <em>preferiresti</em> — la confermiamo noi insieme all’orario.</p>
                <div className="gh-book-chip-row" aria-label="Preferenza oraria facoltativa">
                  {TIME_PREFERENCES.map((item) => (
                    <SelectChip
                      key={item.value}
                      selected={timePreference === item.value}
                      disabled={isTimePreferenceClosed(item.value, selectedDateClosure)}
                      onClick={() => setTimePreference((current) => current === item.value ? '' : item.value)}
                    >
                      {item.label}
                    </SelectChip>
                  ))}
                </div>
                {selectedDateClosure.label && !selectedDateClosure.isClosed ? (
                  <p className="gh-book-availability-note" role="status">
                    {selectedDateClosure.label}. Per quel giorno scegli un’altra preferenza.
                  </p>
                ) : null}
                <p className="gh-book-time-hint">L’orario preciso lo concordiamo noi su WhatsApp.</p>
                {daysAhead !== null && daysAhead < 7 ? (
                  <WarmNotice title="Sei un po’ a corto di preavviso.">
                    La richiesta parte lo stesso — faremo il possibile per trovarti spazio, e ti diciamo subito su WhatsApp come siamo messi.
                  </WarmNotice>
                ) : null}
                {fullPeriod ? (
                  <WarmNotice icon="bell" title={`Periodo pieno (${fullPeriod}):`}>
                    stanno arrivando più richieste del solito, quindi potremmo metterci un po’ di più a risponderti. Mandala comunque — le leggiamo tutte.
                  </WarmNotice>
                ) : null}
              </section>

              <section className="gh-book-step">
                <StepHead number="4" title={`Come sta il pelo di ${selectedPet?.name || 'chi ci porterai'}?`} hint="Ci aiuta a prepararci — poi lo guardiamo insieme all’arrivo." />
                <div className="gh-book-chip-row" aria-label="Condizioni del manto">
                  {COAT_CONDITIONS.map((item) => (
                    <SelectChip key={item.value} selected={coatConditions.includes(item.value)} onClick={() => toggleCoatCondition(item.value)}>
                      {item.label}
                    </SelectChip>
                  ))}
                </div>
                <label className="gh-book-notes-label" htmlFor="coat-notes">Vuoi aggiungere altro? (facoltativo)</label>
                <textarea id="coat-notes" rows={4} maxLength={500} value={coatNotes} onChange={(event) => setCoatNotes(event.target.value)} />
              </section>

              {submitError ? (
                <div className="gh-book-error" role="alert">
                  <strong>Non siamo riusciti a inviare la richiesta.</strong>{' '}
                  Riprova tra un momento — o scrivici direttamente su WhatsApp, va benissimo uguale.
                </div>
              ) : null}
            </div>

            <aside className="gh-book-summary-column">
              <Card padding={24} radius="lg" style={{ borderRadius: 20 }}>
                <Eyebrow style={{ marginBottom: 16 }}>La tua richiesta</Eyebrow>
                <SummaryRow label="Pet" value={selectedPet?.name} />
                <SummaryRow label="Indicazione" value={selectedService?.name} />
                <SummaryRow label="Data desiderata" value={desiredDate ? formatDesiredDate(desiredDate) : ''} />
                <SummaryRow label="Manto" value={selectedCoatLabels.join(', ') || coatNotes.trim()} />
                <p className="gh-book-summary-message">Ti rispondiamo noi su WhatsApp con giorno e ora — di solito in pochi minuti.</p>
                <button className="gh-book-submit" type="submit" disabled={!canSubmit || submitting}>
                  {submitting ? 'Invio in corso…' : 'Invia la richiesta'}
                </button>
              </Card>
            </aside>

            {canSubmit ? (
              <button className="gh-book-mobile-submit" type="submit" disabled={submitting}>
                {submitting ? 'Invio in corso…' : 'Invia la richiesta'}
              </button>
            ) : null}
          </form>
        )}
      </div>
    </main>
  );
}
