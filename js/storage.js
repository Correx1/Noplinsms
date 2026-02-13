// Storage utility for localStorage management
const Storage = {
  // Initialize default data if not exists
  init() {
    if (!localStorage.getItem('sms_initialized')) {
      this.loadDummyData();
      localStorage.setItem('sms_initialized', 'true');
    }
  },

  // Load dummy data from JSON files
  async loadDummyData() {
    try {
      const dataFiles = [
        'students', 'teachers', 'parents', 'classes', 
        'attendance', 'finance', 'users', 'events',
        'notices', 'library', 'books', 'transportation',
        'hostels', 'visitors', 'phone-logs', 'email-logs', 'sms-logs'
      ];

      for (const file of dataFiles) {
        const response = await fetch(`/dummydatas/${file}.json`);
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(`sms_${file}`, JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Error loading dummy data:', error);
    }
  },

  // Get data from localStorage
  get(key) {
    const data = localStorage.getItem(`sms_${key}`);
    return data ? JSON.parse(data) : null;
  },

  // Set data to localStorage
  set(key, value) {
    localStorage.setItem(`sms_${key}`, JSON.stringify(value));
  },

  // Remove data from localStorage
  remove(key) {
    localStorage.removeItem(`sms_${key}`);
  },

  // Clear all SMS data
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sms_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Initialize storage on load
Storage.init();

export default Storage;
