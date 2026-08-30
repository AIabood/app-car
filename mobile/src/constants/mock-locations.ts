/**
 * Suggested places in Jordan
 * Quick-pick shortcuts on the map screen. Live search uses places.service.ts.
 */

import { AppLocation } from '@/types/navigation';

export const MOCK_LOCATIONS: AppLocation[] = [
  {
    id: '1',
    name: 'بوليفارد العبدلي',
    nameAr: 'بوليفارد العبدلي',
    nameEn: 'The Boulevard Abdali',
    latitude: 31.9632,
    longitude: 35.9083,
    address: 'العبدلي، عمان، الأردن',
    descriptionAr: 'العبدلي، عمان، الأردن',
    descriptionEn: 'Al Abdali, Amman, Jordan',
  },
  {
    id: '2',
    name: 'الدوار السابع',
    nameAr: 'الدوار السابع',
    nameEn: '7th Circle',
    latitude: 31.9566,
    longitude: 35.8569,
    address: 'طريق المطار، عمان، الأردن',
    descriptionAr: 'طريق المطار، عمان، الأردن',
    descriptionEn: 'Airport Road, Amman, Jordan',
  },
  {
    id: '3',
    name: 'مطار الملكة علياء الدولي',
    nameAr: 'مطار الملكة علياء الدولي',
    nameEn: 'Queen Alia International Airport',
    latitude: 31.7226,
    longitude: 35.9932,
    address: 'طريق المطار، زيزيا، الأردن',
    descriptionAr: 'طريق المطار، زيزيا، الأردن',
    descriptionEn: 'Airport Rd, Zizya, Jordan',
  },
  {
    id: '4',
    name: 'الجامعة الأردنية',
    nameAr: 'الجامعة الأردنية',
    nameEn: 'University of Jordan',
    latitude: 32.0157,
    longitude: 35.8697,
    address: 'شارع الملكة رانيا، الجبيهة، عمان',
    descriptionAr: 'شارع الملكة رانيا، الجبيهة، عمان',
    descriptionEn: 'Queen Rania St, Jubaiha, Amman',
  },
  {
    id: '5',
    name: 'سيتي مول عمان',
    nameAr: 'سيتي مول عمان',
    nameEn: 'City Mall Amman',
    latitude: 31.9868,
    longitude: 35.8458,
    address: 'شارع الملك عبد الله الثاني، عمان',
    descriptionAr: 'شارع الملك عبد الله الثاني، عمان',
    descriptionEn: 'King Abdullah II St, Amman',
  },
];
