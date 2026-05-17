const APPOINTMENTS_KEY = 'hospitalLocalAppointments';
const MESSAGES_KEY = 'hospitalLocalMessages';

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export function saveLocalAppointment(appointment, doctors) {
  const appointments = readList(APPOINTMENTS_KEY);
  const doctor = doctors.find(d => String(d.id) === String(appointment.doctorId));
  const newAppointment = {
    ...appointment,
    id: Date.now(),
    doctorName: doctor?.name || 'Dr. Preeti Yadav',
  };

  writeList(APPOINTMENTS_KEY, [newAppointment, ...appointments]);
  return newAppointment;
}

export function getLocalAppointments() {
  return readList(APPOINTMENTS_KEY);
}

export function deleteLocalAppointment(id) {
  writeList(APPOINTMENTS_KEY, readList(APPOINTMENTS_KEY).filter(item => item.id !== id));
}

export function saveLocalMessage(message) {
  const messages = readList(MESSAGES_KEY);
  const newMessage = {
    ...message,
    id: Date.now(),
  };

  writeList(MESSAGES_KEY, [newMessage, ...messages]);
  return newMessage;
}

export function getLocalMessages() {
  return readList(MESSAGES_KEY);
}

export function deleteLocalMessage(id) {
  writeList(MESSAGES_KEY, readList(MESSAGES_KEY).filter(item => item.id !== id));
}
