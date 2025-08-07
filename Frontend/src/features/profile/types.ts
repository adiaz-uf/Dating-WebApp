export interface UserProfile {
  longitude: string;
	latitude: string;
  completed_profile: boolean;
  sexual_preferences: string;
  first_name: string;
  id: string;
  username: string;
  gender: string;
  sexual_orinetation: string;
  name: string;
  last_name: string;
  email: string;
  biography: string;
  birth_date: string;
  tags: string[];
  images: string[];
  isOnline: boolean;
  main_img: string; // TODO: delete when bbdd -> test
  liked: boolean; //test
  disliked: boolean; //test
}
