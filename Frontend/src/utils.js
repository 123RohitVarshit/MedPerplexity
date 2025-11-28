// Check for abnormal vitals
export const isVitalAbnormal = (key, value) => {
  if (key === 'bp') {
      const parts = value.split('/');
      if (parts.length !== 2) return false;
      const sys = parseInt(parts[0]);
      const dia = parseInt(parts[1]);
      return sys > 140 || sys < 90 || dia > 90 || dia < 60;
  }
  if (key === 'hr') return value > 100 || value < 60;
  if (key === 'spO2') return parseInt(value) < 95;
  return false;
};