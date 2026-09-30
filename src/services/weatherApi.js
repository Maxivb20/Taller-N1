// Coordenadas de Viña del Mar, Chile
const LAT = "-33.0246";
const LON = "-71.5518";

export const obtenerClimaLocal = async () => {
  try {
    // URL corregida con los parámetros limpios para la API pública de Open-Meteo
    const response = await fetch(`https://open-meteo.com{LAT}&longitude=${LON}&current_weather=true`);
    
    if (!response.ok) {
      throw new Error("Error al conectar con el servicio meteorológico");
    }
    
    const data = await response.json();
    return data.current_weather;
  } catch (error) {
    console.error("Error en la petición de clima:", error);
    return null;
  }
};
