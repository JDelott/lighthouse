import { pool } from './database';
import { Therapist, Appointment, AvailableSlot } from './types';

// Get all therapists for an organization
export async function getTherapists(organizationId: string): Promise<Therapist[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM therapists WHERE organization_id = $1 AND is_active = true ORDER BY name',
      [organizationId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      email: row.email,
      isActive: row.is_active,
      workingHours: row.working_hours,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// Create a default therapist for an organization
export async function createDefaultTherapist(organizationId: string, name: string): Promise<Therapist> {
  const client = await pool.connect();
  try {
    const therapistId = `therapist-${Date.now()}`;
    const result = await client.query(`
      INSERT INTO therapists (id, organization_id, name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `, [therapistId, organizationId, name]);
    
    const row = result.rows[0];
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      email: row.email,
      isActive: row.is_active,
      workingHours: row.working_hours,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } finally {
    client.release();
  }
}

// Get appointments for a date range
export async function getAppointments(
  organizationId: string, 
  startDate: string, 
  endDate: string
): Promise<Appointment[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT a.*, t.name as therapist_name 
      FROM appointments a
      JOIN therapists t ON a.therapist_id = t.id
      WHERE a.organization_id = $1 
      AND a.appointment_date BETWEEN $2 AND $3
      ORDER BY a.appointment_date, a.start_time
    `, [organizationId, startDate, endDate]);
    
    return result.rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      appointmentRequestId: row.appointment_request_id,
      therapistId: row.therapist_id,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      clientEmail: row.client_email,
      appointmentType: row.appointment_type,
      appointmentDate: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// Find available slots for a specific date and therapist
export async function findAvailableSlots(
  therapistId: string,
  date: string, // YYYY-MM-DD
  durationMinutes: number = 60
): Promise<AvailableSlot[]> {
  const client = await pool.connect();
  try {
    // Get therapist working hours
    const therapistResult = await client.query(
      'SELECT name, working_hours FROM therapists WHERE id = $1',
      [therapistId]
    );
    
    if (therapistResult.rows.length === 0) return [];
    
    const therapist = therapistResult.rows[0];
    const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = therapist.working_hours[dayName];
    
    if (!workingDay?.enabled) return [];
    
    // Get existing appointments for this date
    const appointmentsResult = await client.query(`
      SELECT start_time, end_time FROM appointments 
      WHERE therapist_id = $1 AND appointment_date = $2 AND status != 'cancelled'
      ORDER BY start_time
    `, [therapistId, date]);
    
    const existingAppointments = appointmentsResult.rows;
    
    // Generate available slots
    const slots: AvailableSlot[] = [];
    const startTime = workingDay.start;
    const endTime = workingDay.end;
    
    let currentTime = startTime;
    
    while (timeToMinutes(currentTime) + durationMinutes <= timeToMinutes(endTime)) {
      const slotEndTime = minutesToTime(timeToMinutes(currentTime) + durationMinutes);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => 
        timeToMinutes(currentTime) < timeToMinutes(apt.end_time) &&
        timeToMinutes(slotEndTime) > timeToMinutes(apt.start_time)
      );
      
      if (!hasConflict) {
        slots.push({
          date,
          startTime: currentTime,
          endTime: slotEndTime,
          therapistId,
          therapistName: therapist.name,
          durationMinutes
        });
      }
      
      // Move to next 30-minute slot
      currentTime = minutesToTime(timeToMinutes(currentTime) + 30);
    }
    
    return slots;
  } finally {
    client.release();
  }
}

// Find available slots for all therapists in an organization
export async function findAvailableSlotsForOrganization(
  organizationId: string,
  date: string,
  durationMinutes: number = 60
): Promise<AvailableSlot[]> {
  const therapists = await getTherapists(organizationId);
  const allSlots: AvailableSlot[] = [];
  
  for (const therapist of therapists) {
    const slots = await findAvailableSlots(therapist.id, date, durationMinutes);
    allSlots.push(...slots);
  }
  
  // Sort by time, then by therapist name
  return allSlots.sort((a, b) => {
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.therapistName.localeCompare(b.therapistName);
  });
}

// Book an appointment
export async function bookAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const client = await pool.connect();
  try {
    const appointmentId = `appt-${Date.now()}`;
    const result = await client.query(`
      INSERT INTO appointments (
        id, organization_id, appointment_request_id, therapist_id,
        client_name, client_phone, client_email, appointment_type,
        appointment_date, start_time, end_time, duration_minutes, status, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
    `, [
      appointmentId, appointment.organizationId, appointment.appointmentRequestId,
      appointment.therapistId, appointment.clientName, appointment.clientPhone,
      appointment.clientEmail, appointment.appointmentType, appointment.appointmentDate,
      appointment.startTime, appointment.endTime, appointment.durationMinutes,
      appointment.status, appointment.notes
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id,
      organizationId: row.organization_id,
      appointmentRequestId: row.appointment_request_id,
      therapistId: row.therapist_id,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      clientEmail: row.client_email,
      appointmentType: row.appointment_type,
      appointmentDate: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } finally {
    client.release();
  }
}

// Update appointment request status after booking
export async function updateAppointmentRequestStatus(
  appointmentRequestId: string,
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
  appointmentId?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    
    if (appointmentId && status === 'scheduled') {
      updateData.scheduled_appointment = {
        appointmentId,
        status: 'scheduled'
      };
    }
    
    await client.query(`
      UPDATE appointment_requests 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, appointmentRequestId]);
    
    console.log(`✅ Updated appointment request ${appointmentRequestId} to status: ${status}`);
  } finally {
    client.release();
  }
}

// Get upcoming appointments for a therapist
export async function getUpcomingAppointments(
  therapistId: string,
  days: number = 7
): Promise<Appointment[]> {
  const client = await pool.connect();
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const result = await client.query(`
      SELECT * FROM appointments 
      WHERE therapist_id = $1 
      AND appointment_date BETWEEN CURRENT_DATE AND $2
      AND status IN ('scheduled', 'confirmed')
      ORDER BY appointment_date, start_time
    `, [therapistId, endDate.toISOString().split('T')[0]]);
    
    return result.rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      appointmentRequestId: row.appointment_request_id,
      therapistId: row.therapist_id,
      clientName: row.client_name,
      clientPhone: row.client_phone,
      clientEmail: row.client_email,
      appointmentType: row.appointment_type,
      appointmentDate: row.appointment_date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
}

// Helper functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Export helper functions for use in API routes
export { timeToMinutes, minutesToTime };
