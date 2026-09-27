const COPY = {
  invalid_credentials: 'Email o password non corrette.',
  email_not_confirmed: 'Conferma la tua email prima di accedere.',
  user_already_exists: 'Hai già un account: scegli Accedi.',
  weak_password: 'Scegli una password più sicura, di almeno 8 caratteri.',
  over_request_rate_limit: 'Troppi tentativi. Attendi qualche minuto e riprova.',
  over_email_send_rate_limit: 'Attendi qualche minuto prima di richiedere un nuovo messaggio.',
  GH_AUTH_CONFIRMATION_REQUIRED: 'Il tuo account richiede una conferma. Contatta il salone.',
  GH_INVITE_ASSIGNED_ELSEWHERE: 'Questo invito è già collegato a un altro account. Contatta il salone.',
};

export const customerErrorCode = (error) => {
  // Older RPCs put their machine code in message; never return its prose.
  const machineCode = [error?.details, error?.message]
    .map((value) => typeof value === 'string' ? value.match(/^(GH[A-Z0-9_]+)(?=:|$)/)?.[1] : null)
    .find(Boolean);
  return machineCode || error?.code || '';
};

export const customerErrorMessage = (error, fallback = 'Non riusciamo a completare la richiesta. Riprova tra poco o contatta il salone.') => {
  console.warn('Operazione cliente non riuscita', error);
  const code = customerErrorCode(error);
  return Object.hasOwn(COPY, code) ? COPY[code] : fallback;
};
