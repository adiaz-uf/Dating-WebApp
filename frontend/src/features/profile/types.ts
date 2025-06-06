export interface UserProfile {
  id: string;
  username: string;
  name: string;
  last_name: string;
  email: string;
  bio: string;
  tags: string[];
  images: string[];
  isOnline: boolean;
  main_img: string; // TODO: delete when bbdd
  birthdate: string;
}
