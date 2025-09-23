import { type UserProfile } from "../../types";

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  username: 'LeśnyTropiciel',
  avatarUrl: 'https://i.pravatar.cc/150?u=lesny-tropiciel',
  memberSince: '2023-05-15',
  mushroomsFound: 42,
  badges: [
    { id: 'b1', name: 'Pierwszy Krok', icon: 'gps_fixed', description: 'Rozpoznano pierwszego grzyba.' },
    { id: 'b2', name: 'Koneser Borowików', icon: 'emoji_nature', description: 'Rozpoznano 5 borowików.' },
    { id: 'b3', name: 'Nocny Marek', icon: 'nightlight_round', description: 'Rozpoznano grzyba po zmroku.' },
    { id: 'b4', name: 'Król Lasu', icon: 'forest', description: 'Znaleziono 10 różnych gatunków jadalnych.' }
  ]
};