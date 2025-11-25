import axiosInstance from "../../api/axiosInstance";
import { type LeaderboardUser } from "../../types/index";

export const getLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const response = await axiosInstance.get('/leaderboard');
  return response.data;
};