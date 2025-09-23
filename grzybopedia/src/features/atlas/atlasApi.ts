import { type Mushroom } from "../../types/index";

export const mockMushrooms: Mushroom[] = [
  {
    id: '1',
    name: 'Borowik szlachetny',
    latinName: 'Boletus edulis',
    isEdible: true,
    description: 'Jeden z najbardziej cenionych grzybów leśnych, znany ze swojego intensywnego aromatu i smaku. Idealny do suszenia, marynowania i jako składnik wielu potraw. Występuje w lasach iglastych i liściastych od lata do jesieni.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Boletus_edulis_EtgHolger_Krisp.jpg/1200px-Boletus_edulis_EtgHolger_Krisp.jpg',
    location: { lat: 51.1, lng: 17.03 }
  },
  {
    id: '2',
    name: 'Muchomor czerwony',
    latinName: 'Amanita muscaria',
    isEdible: false,
    description: 'Grzyb trujący, charakterystyczny ze względu na swój czerwony kapelusz w białe kropki. Zawiera substancje psychoaktywne. Rośnie powszechnie w lasach iglastych i liściastych.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Amanita_muscaria_3_vliegenzwammen_op_rij.jpg/1200px-Amanita_muscaria_3_vliegenzwammen_op_rij.jpg',
     location: { lat: 54.35, lng: 18.64 }
  },
  {
    id: '3',
    name: 'Kurka (Pieprznik jadalny)',
    latinName: 'Cantharellus cibarius',
    isEdible: true,
    description: 'Popularny grzyb o żółtym zabarwieniu i charakterystycznym, pieprznym smaku. Ceniony w kuchni za swoją jędrność i aromat. Trudny do pomylenia z grzybami trującymi.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Cantharellus_cibarius_in_situ.jpg/1200px-Cantharellus_cibarius_in_situ.jpg',
    location: { lat: 50.06, lng: 19.94 }
  },
];

export const getMushrooms = (): Promise<Mushroom[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMushrooms);
    }, 1000);
  });
};

export const getMushroomById = (id: string): Promise<Mushroom | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mushroom = mockMushrooms.find(m => m.id === id);
      resolve(mushroom);
    }, 500);
  });
};