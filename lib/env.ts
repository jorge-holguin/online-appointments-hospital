// Environment variables with validation and default values
export const env = {
  // API URLs
  API_APP__CITAS_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.252:9012/api/v1/app-citas",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.0.252:9012/api/v1/app-citas",
  API_MAESTRO_URL: process.env.NEXT_PUBLIC_API_MAESTRO_URL || "http://192.168.0.252:9011/api",
  API_SOLICITUDES_URL: process.env.NEXT_PUBLIC_API_SOLICITUDES_URL || "http://192.168.0.252:9012/api/v1/solicitudes",
  
  // reCAPTCHA
  RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  
  // Hospital Info
  HOSPITAL_NAME: process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital José Agurto Tello de Chosica",
  HOSPITAL_ADDRESS: process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "Jr. Cuzco 274 - Chosica",
  HOSPITAL_LOCATION: process.env.NEXT_PUBLIC_HOSPITAL_LOCATION || "Consultorios Externos HJATCH",
  
  // Security Settings
  ALLOW_CONSOLE_ACCESS: process.env.NEXT_PUBLIC_ALLOW_CONSOLE_ACCESS === "true",
};
