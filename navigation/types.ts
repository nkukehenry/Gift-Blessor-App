export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTPVerification: { 
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  };
  Home: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  GroupSettings: { groupId: string };
  EditGroup: { groupId: string };
  Profile: { userId: string };
  EditProfile: undefined;
  CreateWishlist: undefined;
  EditWishlist: { itemId: string };
  JoinGroup: { groupId: string; phoneNumber: string };
}; 