/* TODO: data for examples, delete this file */

import type { UserProfile } from "./types";

export const mockProfileData: UserProfile[] = [
  {
    id: "abc123", // ID from user i am visiting 
    username: "johndoe",
    liked: false,
    disliked: false,
    gender: "male",
    sexual_orinetation: "Heterosexual",
    name: "John",
    last_name: "Doe",
    birthdate: "01-01-2000",
    email: "johndoe@example.com",
    bio: "This is my short bio. I like cats, coffee, and coding.",
    tags: [ "#frontend", "#typescript", "#react"],
    main_img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Doe",
    images: [
      
      "https://picsum.photos/200/300?random=1",
      "https://picsum.photos/200/300?random=2",
      "https://picsum.photos/200/300?random=3",
      "https://picsum.photos/200/300?random=4"
    ],
    isOnline: true,
  },
   {
    id: "1",
    username: "sophie123",
    liked: true,
    disliked: false,
    gender: "female",
    sexual_orinetation: "Heterosexual",
    name: "Sophie",
    last_name: "Taylor",
    email: "sophie@example.com",
    birthdate: "1997-06-15",
    bio: "Designer & plant lover 🌿. Let's talk about weekend plans!",
    tags: ["#design", "#coffee", "#weekend"],
    isOnline: true,
    main_img: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
    images: [
      "https://picsum.photos/id/1011/300/300",
      "https://picsum.photos/id/1012/300/300"
    ]
  },
  {
    id: "2",
    username: "james_m",
    liked: true,
    disliked: false,
    gender: "female",
    sexual_orinetation: "Heterosexual",
    name: "James",
    last_name: "Mitchell",
    email: "james@example.com",
    birthdate: "1993-10-02",
    bio: "Coffee enthusiast ☕ | Weekend hiker | Bookworm 📚",
    tags: ["#books", "#hiking", "#latte"],
    isOnline: false,
    main_img: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
    images: [
      "https://picsum.photos/id/1021/300/300",
      "https://picsum.photos/id/1022/300/300"
    ]
  },
    {
    id: "3",
    username: "emma.vibes",
    liked: false,
    disliked: false,
    gender: "female",
    sexual_orinetation: "Heterosexual",
    name: "Emma",
    last_name: "Stone",
    email: "emma@example.com",
    birthdate: "1995-03-21",
    bio: "Indie music addict 🎧 | Dog mom 🐶 | Tea over coffee",
    tags: ["#indie", "#music", "#dogs"],
    isOnline: true,
    main_img: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
    images: [
      "https://picsum.photos/id/1031/300/300",
      "https://picsum.photos/id/1032/300/300"
    ]
  },
  {
    id: "4",
    username: "mike.now",
    liked: false,
    disliked: true,
    gender: "female",
    sexual_orinetation: "Heterosexual",
    name: "Michael",
    last_name: "Reed",
    email: "michael@example.com",
    birthdate: "1989-12-09",
    bio: "Tech consultant 💻 | Casual gamer 🎮 | Trying out new food spots",
    tags: ["#tech", "#gaming", "#foodie"],
    isOnline: false,
    main_img: "https://img.heroui.chat/image/avatar?w=200&h=200&u=4",
    images: [
      "https://picsum.photos/id/1041/300/300",
      "https://picsum.photos/id/1042/300/300"
    ]
  }
];

/* 
"images": [
  { "url": "https://img1", "is_main": true },
  { "url": "https://img2", "is_main": false },
  { "url": "https://img3", "is_main": false }
]

const mainImage = userProfile.images.find(img => img.is_main);
const otherImages = userProfile.images.filter(img => !img.is_main); 
*/

