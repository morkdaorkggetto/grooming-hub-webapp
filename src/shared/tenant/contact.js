export const getTenantWhatsAppPhone = (tenant) => {
  const phone = tenant?.settings?.whatsapp_phone;
  return typeof phone === 'string' ? phone.trim() : '';
};
