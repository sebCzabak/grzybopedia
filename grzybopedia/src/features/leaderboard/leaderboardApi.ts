import axiosInstance from "../../api/axiosInstance";
import { type LeaderboardUser } from "../../types/index";

/**
 * Pobiera ranking użytkowników z backendu
 * @returns Promise z listą użytkowników w rankingu
 */
export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  try {
    const response = await axiosInstance.get('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania rankingu:', error);
    throw error;
  }
};