// TODO: create real api
import { mockProfileData } from "../features/profile/mockProfileData";

export function getMockProfileById(id: string) {
  return new Promise((resolve, reject) => {
    const profile = mockProfileData.find((p) => p.id === id);
    setTimeout(() => {
      if (profile) resolve(profile);
      else reject("Profile not found");
    }, 300); // simulate async delay
  });
}