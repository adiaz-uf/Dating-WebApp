/* TODO: data for examples, delete this file */

import type { UserProfile } from "./types";

export const mockProfileData: UserProfile = {
  id: "abc123", // ID from user i am visiting 
  username: "johndoe",
  name: "John",
  last_name: "Doe",
  birthdate: "01-01-2000",
  email: "johndoe@example.com",
  bio: "This is my short bio. I like cats, coffee, and coding.",
  tags: ["#catlover", "#frontend", "#typescript", "#react"],
  main_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Doe",
  images: [
    
    "https://picsum.photos/200/300?random=1",
    "https://picsum.photos/200/300?random=2",
    "https://picsum.photos/200/300?random=3",
    "https://picsum.photos/200/300?random=4"
  ],
  isOnline: true,
};

/* 
"images": [
  { "url": "https://img1", "is_main": true },
  { "url": "https://img2", "is_main": false },
  { "url": "https://img3", "is_main": false }
]

const mainImage = userProfile.images.find(img => img.is_main);
const otherImages = userProfile.images.filter(img => !img.is_main); 
*/

