export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Se já é uma URL completa ou base64, retornar como está
  if (imagePath.startsWith("http") || imagePath.startsWith("data:image")) {
    return imagePath;
  }
  
  // Construir URL do backend
  const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
  return `${baseURL}/public/${imagePath}`;
};
