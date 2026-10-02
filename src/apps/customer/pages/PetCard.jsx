import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRequireCustomer } from '../../../shared/auth/useRequireCustomer';
import { getClientQrImageUrl } from '../../../shared/lib/qrCode';
import Eyebrow from '../../../shared/ui/Eyebrow';
import Icon from '../../../shared/ui/Icon';
import Skeleton from '../../../shared/ui/Skeleton';
import { usePetCard } from '../hooks/usePetCard';
import { useCardManifest } from '../hooks/useCardManifest';
import { petCardCopy } from '../lib/petCardCopy';
import { CardPortrait, CardTier, VisitStamps } from '../components/PetCardParts';
import PetCardBank from '../components/PetCardBank';

export function PetCardContent({ pet, snapshot, qr }) {
  const copy = petCardCopy(pet, snapshot);
  return <article className="pet-card-surface" data-pet-card data-tier={snapshot.currentTier?.key || 'none'} aria-label={`La tessera di ${pet.name}`}>
    <Eyebrow style={{ justifyContent: 'center', color: 'var(--color-primary)', marginBottom: 20, lineHeight: 1 }}>GROOMING HUB</Eyebrow>
    <div className="pet-card-identity">
      <CardPortrait pet={pet} tier={snapshot.currentTier?.key} />
      <div><h1 className="gh-stat-num">{pet.name}</h1>{pet.breed && <p className="gh-body">{pet.breed}</p>}</div>
      <CardTier tier={snapshot.currentTier} />
    </div>
    <div className="pet-card-story">
      <p className="gh-area-title">{copy.title}</p>
      {copy.detail && <p className="gh-body">{copy.detail}</p>}
    </div>
    {snapshot.nextTier && <VisitStamps tier={snapshot.nextTier} />}
    <div className="pet-card-foot">
      {copy.rule && <div className="pet-card-rule gh-meta"><p>{copy.rule}</p>{copy.windowRule && <p>{copy.windowRule}</p>}</div>}
      {snapshot.hasRewardPoints && <p className="gh-meta">
        {snapshot.nextTier ? `C’è anche un’altra strada: ${snapshot.nextTier.pointsRequired} punti. ` : ''}
        {snapshot.nextTier ? `${pet.name} ne ha ${snapshot.rewardPointsTotal}.` : `${pet.name} ha ${snapshot.rewardPointsTotal} punti.`}
      </p>}
      {qr && <div className="pet-card-qr"><img src={qr} alt={`QR della scheda pubblica di ${pet.name}`} /></div>}
    </div>
  </article>;
}

function InstallHint() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  return <aside className="pet-card-install">
    <Icon name="tessera" size={22} stroke={1.8} style={{ color: 'var(--color-primary)' }} />
    <div className="gh-meta"><strong>Tienila a portata.</strong> Aggiungila alla schermata Home.</div>
    {(ios || android) && <p className="gh-meta">{ios ? 'Su iPhone: apri questa tessera in Safari, tocca Condividi e Aggiungi alla schermata Home.'
        : android ? 'Su Android: aggiungi l’app alla schermata Home dal menu di Chrome. Tieni premuta l’icona e scegli La tessera.'
        : ''}</p>}
  </aside>;
}

export function PetCardView({ pet, snapshot }) {
  const [qrResult, setQrResult] = useState(null);
  const [bank, setBank] = useState(false);
  const closeBank = useCallback(() => setBank(false), []);
  const qr = qrResult?.token === pet.qr_token ? qrResult.src : null;
  const qrError = qrResult?.token === pet.qr_token && qrResult.error;
  const installReady = useCardManifest(pet);
  useEffect(() => {
    let live = true;
    setBank(false);
    if (pet.qr_token) getClientQrImageUrl(pet.qr_token, 300).then(
      src => { if (live) setQrResult({ token: pet.qr_token, src }); },
      () => { if (live) setQrResult({ token: pet.qr_token, error: true }); },
    );
    return () => { live = false; };
  }, [pet.qr_token]);
  return <>
    <PetCardContent pet={pet} snapshot={snapshot} qr={qr} />
    <div className="pet-card-actions">
      <button type="button" className="gh-btn gh-btn--primary pet-card-show" disabled={!qr} onClick={() => setBank(true)}>
        <Icon name="qr" size={20} stroke={2} /><strong>Mostra al banco</strong>
      </button>
      {(qrError || !pet.qr_token) && <p role="status" className="gh-meta">Il codice non è disponibile. Riprova ricaricando la tessera.</p>}
    </div>
    {installReady && <InstallHint />}
    {bank && qr && <PetCardBank pet={pet} qr={qr} onClose={closeBank} />}
  </>;
}

export function PetCardHeader() {
  return <header className="pet-card-header">
    <Link to="/u/home" className="gh-btn gh-btn--outline pet-card-back" aria-label="Torna alla Home" title="Torna alla Home"><Icon name="chevron-left" size={20} stroke={2} /></Link>
    <p className="gh-area-title">ZavaRoby pet station</p>
    <span aria-hidden="true" />
  </header>;
}

export default function PetCard() {
  const { petId } = useParams();
  const { user, loading: authLoading } = useRequireCustomer();
  const { data, snapshot, loading, error, refetch } = usePetCard(petId);
  return <main className="pet-card-page">
    <PetCardHeader />
    {authLoading || loading || !user ? <div role="status" aria-label="Caricamento tessera"><Skeleton height={380} /></div>
      : error ? <div role="alert" className="gh-body">Non riusciamo a leggere la tessera. <button className="gh-btn gh-btn--outline" onClick={refetch}>Riprova</button></div>
      : !data ? <p className="gh-body">Tessera non disponibile.</p>
      : <PetCardView key={data.id} pet={data} snapshot={snapshot} />}
  </main>;
}
