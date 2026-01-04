import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack Navigator Types
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  GameDetail: { gameId: string };
  PlatformDetail: { platformId: string };
  GenreDetail: { genreId: string };
  CollectionDetail: { collectionId: string };
  Settings: undefined;
  EmulatorConfig: { emulatorId: string };
  ScanProgress: undefined;
  Setup: undefined;
  Search: undefined;
};

/**
 * Main Tab Navigator Types
 */
export type MainTabParamList = {
  Home: undefined;
  Platforms: undefined;
  Genres: undefined;
  Collections: undefined;
  Library: undefined;
};

/**
 * Root Stack Screen Props
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Tab Screen Props - Composite for nested navigation
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

/**
 * Type declaration for useNavigation hook
 */
declare module '@react-navigation/native' {
  export interface ReactNavigation {
    RootParamList: RootStackParamList;
  }
}
