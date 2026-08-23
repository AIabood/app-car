/**
 * Mock Locations in Riyadh
 * Used for drawing routes and selecting destinations on the mock map
 */
export interface MockLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  distance: string; // e.g. "12 كم"
  duration: string; // e.g. "18 دقيقة"
  x: number; // percentage X position on mock map (0 to 100)
  y: number; // percentage Y position on mock map (0 to 100)
  descriptionAr: string;
  descriptionEn: string;
}

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    id: '1',
    nameAr: 'برج المملكة',
    nameEn: 'Kingdom Centre',
    distance: '8.4 كم',
    duration: '12 دقيقة',
    x: 45,
    y: 35,
    descriptionAr: 'طريق الملك فهد، العليا',
    descriptionEn: 'King Fahd Rd, Al Olaya'
  },
  {
    id: '2',
    nameAr: 'برج الفيصلية',
    nameEn: 'Al Faisaliah Tower',
    distance: '10.2 كم',
    duration: '15 دقيقة',
    x: 52,
    y: 48,
    descriptionAr: 'طريق الملك فهد، العليا',
    descriptionEn: 'King Fahd Rd, Al Olaya'
  },
  {
    id: '3',
    nameAr: 'مطار الملك خالد الدولي',
    nameEn: 'King Khalid International Airport',
    distance: '34.5 كم',
    duration: '28 دقيقة',
    x: 75,
    y: 12,
    descriptionAr: 'طريق مطار الملك خالد الدولي',
    descriptionEn: 'Airport Road, Riyadh'
  },
  {
    id: '4',
    nameAr: 'الرياض بارك',
    nameEn: 'Riyadh Park',
    distance: '5.1 كم',
    duration: '8 دقيقة',
    x: 28,
    y: 25,
    descriptionAr: 'طريق الطريق الدائري الشمالي الفرعي',
    descriptionEn: 'Northern Ring Branch Rd'
  },
  {
    id: '5',
    nameAr: 'بوليفارد رياض سيتي',
    nameEn: 'Boulevard Riyadh City',
    distance: '7.3 كم',
    duration: '11 دقيقة',
    x: 20,
    y: 40,
    descriptionAr: 'طريق الأمير تركي بن عبد العزيز الأول، حطين',
    descriptionEn: 'Prince Turki Ibn Abdulaziz Al Awwal Rd, Hittin'
  }
];
