/**
 * Описание изображений для scripts/generate-images.js.
 *
 * name — базовое имя файла, по нему же скрипт загрузки находит
 * картинку для конкретной записи Strapi.
 */

const ATTRACTION_IMAGES = [
  {
    name: "attraction-svobodnoe-padenie",
    title: "Свободное падение 60 м",
    subtitle: "Экстремальный аттракцион",
    badge: "60 м",
    palette: "extreme",
  },
  {
    name: "attraction-ekstrim-pik",
    title: "Американские горки Экстрим-Пик",
    subtitle: "Высота 32 метра, три петли",
    palette: "extreme",
  },
  {
    name: "attraction-koleso-obozreniya",
    title: "Колесо обозрения",
    subtitle: "Панорама Рязани с высоты 55 метров",
    palette: "family",
  },
  {
    name: "attraction-lodochnaya-dorozhka",
    title: "Лодочная дорожка",
    subtitle: "Прогулка по озеру для всей семьи",
    palette: "family",
  },
  {
    name: "attraction-ostrov-sokrovisch",
    title: "Остров сокровищ",
    subtitle: "Детская площадка до 6 лет",
    palette: "child",
  },
  {
    name: "attraction-komnata-vyzhivaniya",
    title: "Комната выживания",
    subtitle: "60 минут с заданиями",
    palette: "child",
  },
];

const NEWS_IMAGES = [
  {
    name: "news-noch-ekstremala",
    title: "Ночь экстремала",
    subtitle: "Парк работает до 03:00",
    palette: "extreme",
  },
  {
    name: "news-svobodnoe-padenie",
    title: "Новый аттракцион",
    subtitle: "Свободное падение 60 м",
    palette: "news",
  },
  {
    name: "news-fotokonkurs",
    title: "Фотоконкурс",
    subtitle: "Лучший кадр парка",
    palette: "gallery",
  },
  {
    name: "news-raspisanie",
    title: "Утренние сеансы в 10:00",
    subtitle: "Изменилось расписание",
    palette: "news",
  },
];

const ALBUM_IMAGES = [
  {
    name: "album-ekstremalnaya-zona",
    title: "Экстремальная зона",
    subtitle: "Главные аттракционы парка",
    palette: "extreme",
  },
  {
    name: "album-semeynaya-zona",
    title: "Семейная зона",
    subtitle: "Весело всей семье",
    palette: "family",
  },
  {
    name: "album-detskiy-ostrov",
    title: "Детский остров",
    subtitle: "Для самых маленьких",
    palette: "child",
  },
  {
    name: "album-territoriya",
    title: "Территория парка",
    subtitle: "Аллеи, фуд-корт и зоны отдыха",
    palette: "gallery",
  },
];

const HERO_IMAGE = {
  name: "park-hero",
  title: "Парк Чудес",
  subtitle: "14 аттракционов в Рязани",
  badge: "Открыты ежедневно",
  palette: "gallery",
  width: 1920,
  height: 1080,
};

module.exports = [
  HERO_IMAGE,
  ...ATTRACTION_IMAGES,
  ...NEWS_IMAGES,
  ...ALBUM_IMAGES,
];