import { type Mushroom } from "../../types/index";
import axiosInstance from "../../api/axiosInstance";

/**
 * Pobiera listę wszystkich grzybów z atlasu
 * @param searchQuery - Opcjonalne zapytanie wyszukiwania (filtrowanie po nazwie lub nazwie łacińskiej)
 * @returns Promise z listą grzybów
 */
export const getMushrooms = async (searchQuery?: string): Promise<Mushroom[]> => {
  try {
    const url = searchQuery ? `/mushrooms?search=${encodeURIComponent(searchQuery)}` : '/mushrooms';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania listy grzybów:', error);
    throw error;
  }
};

/**
 * Pobiera szczegóły grzyba po ID
 * @param id - ID grzyba (int lub GUID jako string)
 * @returns Promise z danymi grzyba lub undefined jeśli nie znaleziono
 */
export const getMushroomById = async (id: string | number): Promise<Mushroom | undefined> => {
  try {
    const response = await axiosInstance.get(`/mushrooms/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined;
    }
    console.error('Błąd podczas pobierania grzyba:', error);
    throw error;
  }
};