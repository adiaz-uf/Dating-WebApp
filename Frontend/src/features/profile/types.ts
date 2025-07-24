export interface UserProfile {
  id: string;
  username: string;
  gender: string;
  sexual_orinetation: string;
  name: string;
  last_name: string;
  email: string;
  bio: string;
  tags: string[];
  images: string[];
  isOnline: boolean;
  main_img: string; // TODO: delete when bbdd -> test
  birthdate: string;
  liked: boolean; //test
  disliked: boolean; //test
}
