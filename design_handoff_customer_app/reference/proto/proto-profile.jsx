// ───────────────────────────────────────────────────────────
// PROTO · Profile (view + edit) + 404 fallback
// ───────────────────────────────────────────────────────────

const { useState: useStateProf } = React;

const ProfileScreen = () => {
  const { viewport, user, pets, nav, set, toast } = useApp();
  const isMobile = viewport === 'mobile';
  const [editing, setEditing] = useStateProf(false);
  const [form, setForm] = useStateProf({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
  });
  const upd = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    set({ user: { ...user, ...form } });
    setEditing(false);
    toast('Profilo aggiornato');
  };

  const logout = () => {
    if (!confirm('Esci dal prototipo?')) return;
    set({
      ...INITIAL_STATE,
      viewport: viewport,
      route: { name: 'login', params: {} },
    });
  };

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-main)' }}>
      {!isMobile && <TopNav active="profile"/>}

      <div style={{ padding: isMobile ? '18px 22px 24px' : '40px 48px 60px', maxWidth: isMobile ? 'unset' : 720, margin: '0 auto' }}>

        {isMobile && (
          <button onClick={() => nav('dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 13, color: 'var(--color-text-secondary)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginBottom: 14, fontFamily: 'inherit',
          }}>← Home</button>
        )}

        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--color-text-secondary)',
          marginBottom: 10,
        }}>Il tuo profilo</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 18,
          marginBottom: 28,
        }}>
          <div style={{
            width: isMobile ? 64 : 84, height: isMobile ? 64 : 84, borderRadius: '50%',
            background: 'var(--color-surface-muted)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-serif)', fontWeight: 500,
            fontSize: isMobile ? 26 : 34,
            color: 'var(--color-secondary)',
          }}>{(user?.name || '?').slice(0,1).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: isMobile ? 26 : 36, fontWeight: 500,
              lineHeight: 1.1, letterSpacing: '-0.01em',
              margin: '0 0 4px',
            }}>{user?.name}</h1>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{user?.email}</div>
          </div>
        </div>

        {/* Info card */}
        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          padding: 20, marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--color-text-secondary)',
            }}>Dati personali</div>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                background: 'transparent', color: 'var(--color-link)',
                border: 'none', padding: 0, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Modifica</button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <AuthField label="Nome e cognome" value={form.name} onChange={upd('name')}/>
              <AuthField label="Email" type="email" value={form.email} onChange={upd('email')}/>
              <AuthField label="Telefono" type="tel" value={form.phone} onChange={upd('phone')} required={false}/>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={save} style={{
                  background: 'var(--color-primary)', color: '#FBF6F3',
                  border: 'none', borderRadius: 'var(--r-md)',
                  padding: '10px 20px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Salva</button>
                <button onClick={() => { setEditing(false); setForm({ name: user?.name, email: user?.email, phone: user?.phone || '' }); }} style={{
                  background: 'transparent', color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)',
                  padding: '10px 20px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Annulla</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ProfileRow label="Nome" value={user?.name}/>
              <ProfileRow label="Email" value={user?.email}/>
              <ProfileRow label="Telefono" value={user?.phone || '—'}/>
            </div>
          )}
        </div>

        {/* Pets shortcut */}
        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          padding: 20, marginBottom: 16,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--color-text-secondary)',
            marginBottom: 14,
          }}>I tuoi pet</div>
          {pets.map(p => (
            <button key={p.id} onClick={() => nav('pet', { id: p.id })} style={{
              width: '100%', background: 'none', border: 'none', padding: 0,
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
              marginBottom: 10,
            }}>
              <PetAvatarProto pet={p} size={44}/>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{p.breed}</div>
              </div>
              <TierBadge tier={p.tier}/>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          background: 'var(--color-surface-main)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}>
          {[
            { label: 'Notifiche', hint: 'Email, SMS, promemoria' },
            { label: 'Privacy e dati', hint: 'Gestisci i tuoi dati' },
            { label: 'Aiuto e contatti', hint: 'Parla con noi' },
          ].map((it, i, arr) => (
            <button key={i} onClick={() => toast('Sezione demo: non ancora implementata', 'error')}
              style={{
                width: '100%', padding: 18, background: 'none',
                border: 'none',
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', textAlign: 'left',
              }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{it.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{it.hint}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          ))}
        </div>

        <button onClick={logout} style={{
          width: '100%', marginTop: 24,
          background: 'transparent', color: 'var(--color-danger-text)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--r-md)',
          padding: '12px 20px', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Esci dal tuo account</button>
      </div>

      {isMobile && <BottomNav active="profile"/>}
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right' }}>{value}</span>
  </div>
);

const NotFoundScreen = () => {
  const { nav } = useApp();
  return (
    <div style={{
      padding: '80px 40px', textAlign: 'center', maxWidth: 500, margin: '0 auto',
    }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, margin: '0 0 12px' }}>Pagina non trovata</h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 22px' }}>
        Schermata non implementata in questo prototipo.
      </p>
      <button onClick={() => nav('dashboard')} style={{
        background: 'var(--color-primary)', color: '#FBF6F3',
        border: 'none', borderRadius: 'var(--r-md)',
        padding: '12px 22px', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>Torna alla home</button>
    </div>
  );
};

registerRoute('profile', ProfileScreen);
registerRoute('notfound', NotFoundScreen);
