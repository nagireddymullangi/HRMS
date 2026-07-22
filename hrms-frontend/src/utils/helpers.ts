export const formatDate = (date?: string | Date | null): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (date?: string | Date | null): string => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num?: number): string => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name?: string): string => {
  const colors = [
    '#6366f1','#8b5cf6','#ec4899','#f43f5e',
    '#f97316','#eab308','#22c55e','#14b8a6',
    '#0ea5e9','#3b82f6','#a855f7','#ef4444',
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
};

export const getYearsOfExperience = (joiningDate?: string): string => {
  if (!joiningDate) return '—';
  const today   = new Date();
  const joining = new Date(joiningDate);
  const years   = today.getFullYear() - joining.getFullYear();
  const months  = today.getMonth()    - joining.getMonth();
  if (years === 0) return `${months < 0 ? 0 : months} months`;
  return months < 0 ? `${years - 1} years` : `${years} years`;
};

export const calculateAge = (dob?: string): number => {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
     (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

export const truncate = (text?: string, max = 30): string => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const formatRole = (role?: string): string =>
  role ? role.replace(/_/g, ' ') : '';

export const capitalizeFirst = (str?: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone);

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const generateEmployeeId = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EMP${year}${rand}`;
};