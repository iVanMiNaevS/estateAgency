/**
 * Источники изображений: Wikimedia Commons.
 *
 * Для каждой картинки указаны автор, лицензия и ссылка. Файл
 * публичного достояния или Creative Commons, поэтому фотографии
 * можно использовать в учебном проекте при сохранении атрибуции —
 * она попадает в scripts/IMAGE-CREDITS.md и на страницу галереи.
 *
 * Лицензия CC BY требует указания автора, CC BY-SA — ещё и того, что
 * производные работы распространяются на тех же условиях.
 */

/** @type {{name: string, title: string, width: number, height: number}[]} */
module.exports = [
  {
    // Первый экран шире остальных картинок, но ночное колесо
    // обозрения с огнями плохо сжимается: 1920 упирается в 200 КБ,
    // поэтому берём 1600 — на экранах до 1600 это без потерь.
    name: "park-hero",
    title: "Ferris wheel Nice Dec 2008 a.jpg",
    author: "Cayambe",
    license: "CC BY-SA 3.0",
    width: 1600,
    height: 900,
  },
  {
    name: "attraction-svobodnoe-padenie",
    title: "Drop tower ride.jpg",
    author: "Wikimedia Commons contributors",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 900,
  },
  {
    name: "attraction-ekstrim-pik",
    title: "Baishamen Park - amusement park - roller coaster, adult - 01.jpg",
    author: "Anna Frodesiak",
    license: "CC0",
    width: 1200,
    height: 800,
  },
  {
    name: "attraction-koleso-obozreniya",
    title: "Illuminated Ferris wheel at dusk in Vientiane, Laos.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 800,
  },
  {
    name: "attraction-lodochnaya-dorozhka",
    title: "Take a boat ride on Upper Waterton Lake (53087475969).jpg",
    author: "GlacierNPS",
    license: "Public domain",
    width: 1200,
    height: 800,
  },
  {
    name: "attraction-ostrov-sokrovisch",
    title: "Baishamen Park - amusement park - roller coaster, kiddie - 01.jpg",
    author: "Anna Frodesiak",
    license: "CC0",
    width: 1200,
    height: 800,
  },
  {
    name: "attraction-komnata-vyzhivaniya",
    title: "Escape room (42169658204).jpg",
    author: "Eric Fischer",
    license: "CC BY 2.0",
    width: 1200,
    height: 800,
  },
  {
    name: "news-noch-ekstremala",
    title:
      "Illuminated Ferris wheel, bouncing castle and carousel at night in a funfair in Vientiane, Laos.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 800,
  },
  {
    name: "news-svobodnoe-padenie",
    title: "Mega Drop tower ride at the CNE in 2008.jpg",
    author: "Ian Muttoo",
    license: "CC BY-SA 2.0",
    width: 1200,
    height: 800,
  },
  {
    name: "news-fotokonkurs",
    title: "Amusement Park by Night (48726828301).jpg",
    author: "Dejan Krsmanovic",
    license: "CC BY 2.0",
    width: 1200,
    height: 800,
  },
  {
    name: "news-raspisanie",
    title: "Le Touquet - The merry-go-round on the waterfront.jpg",
    author: "Dr Dobeaucoup",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 675,
  },
  {
    name: "news-halloween",
    title: "Halloween Pumpkin Lantern, Ayrshire, Scotland.jpg",
    author: "Rosser1954",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 900,
  },
  {
    name: "news-ledyanoy-gorod",
    title: "Winter Festival 2011 ice skating rink King George Square Brisbane P1140966.jpg",
    author: "John Robert McPherson",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 900,
  },
  {
    name: "news-semeyny-marafon",
    title:
      "DFC 4928 Children giggle and ride a brightly lit kiddie train at a nighttime fair in Sattahip Chon Buri.jpg",
    author: "PattayaPatrol",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 800,
  },
  {
    name: "album-ekstremalnaya-zona",
    title: "Giant Drop themeing.jpg",
    author: "Troy Kelly",
    license: "CC BY 2.0",
    width: 1200,
    height: 800,
  },
  {
    name: "album-semeynaya-zona",
    title: "The Swing Carousel - Flickr - Stig Nygaard.jpg",
    author: "Stig Nygaard",
    license: "CC BY 2.0",
    width: 1200,
    height: 800,
  },
  {
    name: "album-detskiy-ostrov",
    title: "Carousel, 6th of October City, Egypt.JPG",
    author: "Faris El-Gwely",
    license: "CC BY-SA 4.0",
    width: 1200,
    height: 800,
  },
  {
    name: "album-territoriya",
    title: "Seibuen Amusement Park (9996459904).jpg",
    author: "Tomohiro Ohtake",
    license: "CC BY 2.0",
    width: 1200,
    height: 800,
  },
];