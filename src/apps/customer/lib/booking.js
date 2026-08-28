import { supabase } from '../../../shared/supabase/client';

export async function getBookingServices(tenantId) {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, display_order')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('display_order')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function submitAppointmentRequest(input) {
  const { data, error } = await supabase.rpc('submit_appointment_request', {
    p_tenant_id: input.tenantId,
    p_pet_id: input.petId,
    p_service_id: input.serviceId,
    p_desired_date: input.desiredDate,
    p_time_preference: input.timePreference || null,
    p_coat_condition_codes: input.coatConditionCodes,
    p_coat_condition_notes: input.coatConditionNotes?.trim() || null,
    p_declared_pet_age: input.declaredPetAge?.trim() || null,
  });

  if (error) throw error;
  return data;
}
