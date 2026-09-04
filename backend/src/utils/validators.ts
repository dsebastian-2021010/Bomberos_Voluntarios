export function validateEmail(email: string): boolean {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email);
}

export function validatePassword(password: string): boolean {
  // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
}

export function validatePhoneNumber(phone: string): boolean {
  const regex = /^[0-9]{8,15}$/;
  return regex.test(phone.replace(/\D/g, ''));
}

export function validateRol(rol: string): boolean {
  return ['superadmin', 'admin', 'usuario'].includes(rol);
}
