# 🗓️ Internal Calendar System Setup

Your simple internal calendar system is now ready! This adds real-time appointment booking capabilities to your AI assistant.

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
# Run the setup script to create tables and default data
node setup-calendar.js
```

### 2. Restart Your Development Server
```bash
npm run dev
```

### 3. Visit Your Dashboard
Go to http://localhost:3000/dashboard and scroll down to see the new **Appointment Calendar** section.

## ✨ What's New

### Features Added:
- **📅 Real-time availability checking** - See available appointment slots
- **⚡ Instant booking** - Book appointments directly from the dashboard
- **👨‍⚕️ Therapist management** - Default therapists created for each organization
- **🕐 Working hours** - Configurable schedules (default: Mon-Fri 9AM-5PM)
- **📊 Calendar integration** - Seamlessly integrated with your existing dashboard

### API Endpoints Added:
- `GET /api/calendar/availability` - Get available appointment slots
- `POST /api/calendar/book` - Book an appointment
- `GET /api/therapists` - Get therapists for organization
- `POST /api/therapists` - Create new therapist

## 🗃️ Database Changes

### New Tables:
- **`therapists`** - Stores therapist information and working hours
- **`appointments`** - Confirmed appointment bookings

### Sample Data:
- Default therapist created for each organization
- Sample appointments added for testing

## 🎯 How It Works

1. **Client calls your AI assistant** → Existing flow unchanged
2. **AI extracts appointment preferences** → Existing functionality
3. **NEW: AI checks real availability** → Uses new calendar system
4. **NEW: AI books confirmed appointment** → Real-time booking
5. **Therapist sees booked appointment** → In dashboard calendar

## 🔧 Configuration

### Working Hours (Default):
- **Monday-Friday:** 9:00 AM - 5:00 PM
- **Saturday-Sunday:** Disabled
- **Appointment Duration:** 60 minutes
- **Booking Slots:** Every 30 minutes

### Customization:
You can modify working hours by updating the `working_hours` JSONB field in the `therapists` table or through the API.

## 🧪 Testing

### Test the Calendar:
1. Go to your dashboard
2. Scroll to "Appointment Calendar" section
3. Select a date (today or future)
4. You should see available time slots
5. Click "Book Appointment" to test booking (requires client info)

### Test with AI Assistant:
1. Call your Vapi number
2. Request an appointment
3. The AI should now be able to check real availability
4. Booked appointments will appear in your dashboard

## 🔄 Integration with Existing System

### Appointment Requests:
- Your existing `appointment_requests` table remains unchanged
- New `appointments` table stores confirmed bookings
- The two are linked via `appointment_request_id`

### Call Processing:
- Your existing call processing continues to work
- Calendar system adds real-time availability checking
- Booking updates appointment request status to "scheduled"

## 📈 Next Steps

### Immediate:
1. ✅ Test the calendar functionality
2. ✅ Create additional therapists if needed
3. ✅ Customize working hours

### Future Enhancements:
- **External Calendar Sync** (Google Calendar, Outlook)
- **Advanced Scheduling Rules** (buffer times, appointment types)
- **Automated Reminders** (SMS, email notifications)
- **Waitlist Management** (automatic rebooking)
- **Multi-location Support** (office, telehealth)

## 🔧 Troubleshooting

### Common Issues:

**No available slots showing:**
- Check that therapists exist for your organization
- Verify working hours are enabled for the selected day
- Ensure no conflicts with existing appointments

**Calendar not loading:**
- Check browser console for errors
- Verify API endpoints are accessible
- Ensure database migration completed successfully

**Booking fails:**
- Verify client information is provided
- Check for database constraint violations
- Ensure therapist exists and is active

### Debug Commands:
```bash
# Check therapists
curl http://localhost:3000/api/therapists

# Check availability
curl "http://localhost:3000/api/calendar/availability?date=2024-01-15"
```

## 📊 Database Schema

### Therapists Table:
```sql
therapists (
  id VARCHAR(255) PRIMARY KEY,
  organization_id VARCHAR(255) REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  working_hours JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Appointments Table:
```sql
appointments (
  id VARCHAR(255) PRIMARY KEY,
  organization_id VARCHAR(255) REFERENCES organizations(id),
  appointment_request_id VARCHAR(255) REFERENCES appointment_requests(id),
  therapist_id VARCHAR(255) REFERENCES therapists(id),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  appointment_type VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

---

🎉 **Congratulations!** Your AI assistant now has real-time appointment booking capabilities. This transforms it from a "glorified voicemail" into a true AI receptionist that can actually schedule appointments!

Your value proposition just got significantly stronger. Clients now get instant appointment confirmation instead of waiting for callbacks.
