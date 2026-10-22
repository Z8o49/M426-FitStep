import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorageRepository } from './storageRepository';

export const appRepository = createStorageRepository(AsyncStorage);
