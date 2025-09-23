export interface Mushroom {
  id: string; 
  name: string;
  latinName: string;
  description: string;
  isEdible: boolean;
  imageUrl?: string;
  location:{lat:number,lng:number};
}
export interface Badge {
  id: string;
  name: string;
  icon: string; 
  description: string;
}

export interface UserProfile{
  id:string;
  username:string;
  avatarUrl:string;
  memberSince:string;
  mushroomsFound:number;
  badges:Badge[];
}

export interface LeaderboardUser{
  rank:number;
  username:string;
  avatarUrl:string;
  points:number;
  badgesCount: number;
}